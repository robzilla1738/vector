
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4277dc8: d10143ff     	sub	sp, sp, #0x50
 4277dcc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4277dd0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4277dd4: 910103fd     	add	x29, sp, #0x40
 4277dd8: aa0003f4     	mov	x20, x0
 4277ddc: aa0803f3     	mov	x19, x8
 4277de0: a9007d1f     	stp	xzr, xzr, [x8]
 4277de4: f900091f     	str	xzr, [x8, #0x10]
 4277de8: 39807c04     	ldrsb	x4, [x0, #0x1f]
 4277dec: b7f80804     	tbnz	x4, #0x3f, 0x4277eec <_ChromeMain+0x4272c50>
 4277df0: 91002283     	add	x3, x20, #0x8
 4277df4: d004c321     	adrp	x1, 0xdadd000 <dyld_stub_binder+0xdadd000>
 4277df8: 91141c21     	add	x1, x1, #0x507
 4277dfc: aa1303e0     	mov	x0, x19
 4277e00: 528000a2     	mov	w2, #0x5                ; =5
 4277e04: 9750a1f1     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4277e08: 3980de84     	ldrsb	x4, [x20, #0x37]
 4277e0c: b7f80744     	tbnz	x4, #0x3f, 0x4277ef4 <_ChromeMain+0x4272c58>
 4277e10: 91008283     	add	x3, x20, #0x20
 4277e14: f004bca1     	adrp	x1, 0xda0e000 <dyld_stub_binder+0xda0e000>
 4277e18: 911cd021     	add	x1, x1, #0x734
 4277e1c: aa1303e0     	mov	x0, x19
 4277e20: 52800102     	mov	w2, #0x8                ; =8
 4277e24: 9750a1e9     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4277e28: 3981be84     	ldrsb	x4, [x20, #0x6f]
 4277e2c: b7f80684     	tbnz	x4, #0x3f, 0x4277efc <_ChromeMain+0x4272c60>
 4277e30: 91016283     	add	x3, x20, #0x58
 4277e34: d004ac21     	adrp	x1, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 4277e38: 91180021     	add	x1, x1, #0x600
 4277e3c: aa1303e0     	mov	x0, x19
 4277e40: 528000a2     	mov	w2, #0x5                ; =5
 4277e44: 9750a1e1     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4277e48: fd403a80     	ldr	d0, [x20, #0x70]
 4277e4c: 910023e0     	add	x0, sp, #0x8
 4277e50: 97388f3c     	bl	0x109bb40 <_ChromeMain+0x10968a4>
 4277e54: 52800068     	mov	w8, #0x3                ; =3
 4277e58: 390083e8     	strb	w8, [sp, #0x20]
 4277e5c: b004c3a1     	adrp	x1, 0xdaec000 <dyld_stub_binder+0xdaec000>
 4277e60: 9138ac21     	add	x1, x1, #0xe2b
 4277e64: 910023e3     	add	x3, sp, #0x8
 4277e68: aa1303e0     	mov	x0, x19
 4277e6c: 52800102     	mov	w2, #0x8                ; =8
 4277e70: 970b0c14     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4277e74: 394083e8     	ldrb	w8, [sp, #0x20]
 4277e78: f103fd1f     	cmp	x8, #0xff
 4277e7c: 540000e0     	b.eq	0x4277e98 <_ChromeMain+0x4272bfc>
 4277e80: d0053249     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4277e84: 9121e129     	add	x9, x9, #0x878
 4277e88: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4277e8c: d10047a0     	sub	x0, x29, #0x11
 4277e90: 910023e1     	add	x1, sp, #0x8
 4277e94: d63f0100     	blr	x8
 4277e98: 9101e283     	add	x3, x20, #0x78
 4277e9c: 39823e84     	ldrsb	x4, [x20, #0x8f]
 4277ea0: b7f80324     	tbnz	x4, #0x3f, 0x4277f04 <_ChromeMain+0x4272c68>
 4277ea4: 340000c4     	cbz	w4, 0x4277ebc <_ChromeMain+0x4272c20>
 4277ea8: 9004c561     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4277eac: 91139421     	add	x1, x1, #0x4e5
 4277eb0: aa1303e0     	mov	x0, x19
 4277eb4: 528001e2     	mov	w2, #0xf                ; =15
 4277eb8: 9750a1c4     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4277ebc: 91024283     	add	x3, x20, #0x90
 4277ec0: 39829e84     	ldrsb	x4, [x20, #0xa7]
 4277ec4: b7f80284     	tbnz	x4, #0x3f, 0x4277f14 <_ChromeMain+0x4272c78>
 4277ec8: 340002e4     	cbz	w4, 0x4277f24 <_ChromeMain+0x4272c88>
 4277ecc: 9004b7c1     	adrp	x1, 0xd96f000 <dyld_stub_binder+0xd96f000>
 4277ed0: 911e1c21     	add	x1, x1, #0x787
 4277ed4: aa1303e0     	mov	x0, x19
 4277ed8: 52800182     	mov	w2, #0xc                ; =12
 4277edc: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4277ee0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4277ee4: 910143ff     	add	sp, sp, #0x50
 4277ee8: 1750a1b8     	b	0x16a05c8 <_ChromeMain+0x169b32c>
 4277eec: a9409283     	ldp	x3, x4, [x20, #0x8]
 4277ef0: 17ffffc1     	b	0x4277df4 <_ChromeMain+0x4272b58>
 4277ef4: a9421283     	ldp	x3, x4, [x20, #0x20]
 4277ef8: 17ffffc7     	b	0x4277e14 <_ChromeMain+0x4272b78>
 4277efc: a9459283     	ldp	x3, x4, [x20, #0x58]
 4277f00: 17ffffcd     	b	0x4277e34 <_ChromeMain+0x4272b98>
 4277f04: f9404284     	ldr	x4, [x20, #0x80]
 4277f08: b4fffda4     	cbz	x4, 0x4277ebc <_ChromeMain+0x4272c20>
 4277f0c: f9400063     	ldr	x3, [x3]
 4277f10: 17ffffe6     	b	0x4277ea8 <_ChromeMain+0x4272c0c>
 4277f14: f9404e84     	ldr	x4, [x20, #0x98]
 4277f18: b4000064     	cbz	x4, 0x4277f24 <_ChromeMain+0x4272c88>
 4277f1c: f9400063     	ldr	x3, [x3]
 4277f20: 17ffffeb     	b	0x4277ecc <_ChromeMain+0x4272c30>
 4277f24: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4277f28: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4277f2c: 910143ff     	add	sp, sp, #0x50
 4277f30: d65f03c0     	ret
 4277f34: d10283ff     	sub	sp, sp, #0xa0
 4277f38: a9065ff8     	stp	x24, x23, [sp, #0x60]
 4277f3c: a90757f6     	stp	x22, x21, [sp, #0x70]
 4277f40: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4277f44: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4277f48: 910243fd     	add	x29, sp, #0x90
 4277f4c: aa0803f3     	mov	x19, x8
 4277f50: 3940c008     	ldrb	w8, [x0, #0x30]
 4277f54: 36001248     	tbz	w8, #0x0, 0x427819c <_ChromeMain+0x4272f00>
 4277f58: aa0003f4     	mov	x20, x0
 4277f5c: f9401008     	ldr	x8, [x0, #0x20]
 4277f60: b4000268     	cbz	x8, 0x4277fac <_ChromeMain+0x4272d10>
 4277f64: f9400e88     	ldr	x8, [x20, #0x18]
 4277f68: 39406109     	ldrb	w9, [x8, #0x18]
 4277f6c: 7100113f     	cmp	w9, #0x4
 4277f70: 540001e1     	b.ne	0x4277fac <_ChromeMain+0x4272d10>
 4277f74: d0055669     	adrp	x9, 0xed45000 <dyld_stub_binder+0xed45000>
 4277f78: 910c2129     	add	x9, x9, #0x308
 4277f7c: 38bfc129     	ldaprb	w9, [x9]
 4277f80: 36001109     	tbz	w9, #0x0, 0x42781a0 <_ChromeMain+0x4272f04>
 4277f84: d0055669     	adrp	x9, 0xed45000 <dyld_stub_binder+0xed45000>
 4277f88: f9417d36     	ldr	x22, [x9, #0x2f8]
 4277f8c: b40009d6     	cbz	x22, 0x42780c4 <_ChromeMain+0x4272e28>
 4277f90: 39805d09     	ldrsb	x9, [x8, #0x17]
 4277f94: a9402d0a     	ldp	x10, x11, [x8]
 4277f98: f100013f     	cmp	x9, #0x0
 4277f9c: 9a884155     	csel	x21, x10, x8, mi
 4277fa0: 7100013f     	cmp	w9, #0x0
 4277fa4: 9a894177     	csel	x23, x11, x9, mi
 4277fa8: 1400002e     	b	0x4278060 <_ChromeMain+0x4272dc4>
 4277fac: 528002a8     	mov	w8, #0x15               ; =21
 4277fb0: 39011fe8     	strb	w8, [sp, #0x47]
 4277fb4: 9100c3e9     	add	x9, sp, #0x30
 4277fb8: 9100552a     	add	x10, x9, #0x15
 4277fbc: f0046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4277fc0: 910f7d08     	add	x8, x8, #0x3df
 4277fc4: eb08015f     	cmp	x10, x8
 4277fc8: fa488122     	ccmp	x9, x8, #0x2, hi
 4277fcc: 54000e89     	b.ls	0x427819c <_ChromeMain+0x4272f00>
 4277fd0: 3dc00100     	ldr	q0, [x8]
 4277fd4: 3d800fe0     	str	q0, [sp, #0x30]
 4277fd8: f840d108     	ldur	x8, [x8, #0xd]
 4277fdc: f803d3e8     	stur	x8, [sp, #0x3d]
 4277fe0: 390117ff     	strb	wzr, [sp, #0x45]
 4277fe4: 9100c3e1     	add	x1, sp, #0x30
 4277fe8: aa1303e8     	mov	x8, x19
 4277fec: aa1403e0     	mov	x0, x20
 4277ff0: 94a7fcd8     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4277ff4: 90015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4277ff8: 91397108     	add	x8, x8, #0xe5c
 4277ffc: a93c7fa8     	stp	x8, xzr, [x29, #-0x40]
 4278000: f90027f4     	str	x20, [sp, #0x48]
 4278004: b000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4278008: 91120000     	add	x0, x0, #0x480
 427800c: d10103a1     	sub	x1, x29, #0x40
 4278010: 910123e2     	add	x2, sp, #0x48
 4278014: 94a802f1     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4278018: f9000660     	str	x0, [x19, #0x8]
 427801c: 52800028     	mov	w8, #0x1                ; =1
 4278020: 39004268     	strb	w8, [x19, #0x10]
 4278024: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4278028: 36f800a8     	tbz	w8, #0x1f, 0x427803c <_ChromeMain+0x4272da0>
 427802c: f9401be0     	ldr	x0, [sp, #0x30]
 4278030: f94023e8     	ldr	x8, [sp, #0x40]
 4278034: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4278038: 96f643a0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427803c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4278040: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4278044: a94757f6     	ldp	x22, x21, [sp, #0x70]
 4278048: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 427804c: 910283ff     	add	sp, sp, #0xa0
 4278050: d65f03c0     	ret
 4278054: 54000223     	b.lo	0x4278098 <_ChromeMain+0x4272dfc>
 4278058: f94006d6     	ldr	x22, [x22, #0x8]
 427805c: b4000356     	cbz	x22, 0x42780c4 <_ChromeMain+0x4272e28>
 4278060: aa1603e8     	mov	x8, x22
 4278064: f8420d09     	ldr	x9, [x8, #0x20]!
 4278068: 39805d0a     	ldrsb	x10, [x8, #0x17]
 427806c: f100015f     	cmp	x10, #0x0
 4278070: 9a884121     	csel	x1, x9, x8, mi
 4278074: f9400508     	ldr	x8, [x8, #0x8]
 4278078: 7100015f     	cmp	w10, #0x0
 427807c: 9a8a4118     	csel	x24, x8, x10, mi
 4278080: eb17031f     	cmp	x24, x23
 4278084: 9a973302     	csel	x2, x24, x23, lo
 4278088: aa1503e0     	mov	x0, x21
 427808c: 94f645f5     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4278090: 340000a0     	cbz	w0, 0x42780a4 <_ChromeMain+0x4272e08>
 4278094: 36fffe20     	tbz	w0, #0x1f, 0x4278058 <_ChromeMain+0x4272dbc>
 4278098: f94002d6     	ldr	x22, [x22]
 427809c: b5fffe36     	cbnz	x22, 0x4278060 <_ChromeMain+0x4272dc4>
 42780a0: 14000009     	b	0x42780c4 <_ChromeMain+0x4272e28>
 42780a4: eb1802ff     	cmp	x23, x24
 42780a8: 54fffd61     	b.ne	0x4278054 <_ChromeMain+0x4272db8>
 42780ac: b0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42780b0: 910be108     	add	x8, x8, #0x2f8
 42780b4: eb0802df     	cmp	x22, x8
 42780b8: 54000060     	b.eq	0x42780c4 <_ChromeMain+0x4272e28>
 42780bc: f9401ec0     	ldr	x0, [x22, #0x38]
 42780c0: b5000480     	cbnz	x0, 0x4278150 <_ChromeMain+0x4272eb4>
 42780c4: 528002a8     	mov	w8, #0x15               ; =21
 42780c8: 39009fe8     	strb	w8, [sp, #0x27]
 42780cc: 910043e9     	add	x9, sp, #0x10
 42780d0: 9100552a     	add	x10, x9, #0x15
 42780d4: d0046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42780d8: 910f7d08     	add	x8, x8, #0x3df
 42780dc: eb08015f     	cmp	x10, x8
 42780e0: fa488122     	ccmp	x9, x8, #0x2, hi
 42780e4: 540005c9     	b.ls	0x427819c <_ChromeMain+0x4272f00>
 42780e8: 3dc00100     	ldr	q0, [x8]
 42780ec: 3d8007e0     	str	q0, [sp, #0x10]
 42780f0: f840d108     	ldur	x8, [x8, #0xd]
 42780f4: f801d3e8     	stur	x8, [sp, #0x1d]
 42780f8: 390097ff     	strb	wzr, [sp, #0x25]
 42780fc: 910043e1     	add	x1, sp, #0x10
 4278100: aa1303e8     	mov	x8, x19
 4278104: aa1403e0     	mov	x0, x20
 4278108: 94a7fc92     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 427810c: f0014fe8     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4278110: 91397108     	add	x8, x8, #0xe5c
 4278114: a93c7fa8     	stp	x8, xzr, [x29, #-0x40]
 4278118: f90027f4     	str	x20, [sp, #0x48]
 427811c: b000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4278120: 91120000     	add	x0, x0, #0x480
 4278124: d10103a1     	sub	x1, x29, #0x40
 4278128: 910123e2     	add	x2, sp, #0x48
 427812c: 94a802ab     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4278130: f9000660     	str	x0, [x19, #0x8]
 4278134: 52800028     	mov	w8, #0x1                ; =1
 4278138: 39004268     	strb	w8, [x19, #0x10]
 427813c: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4278140: 36fff7e8     	tbz	w8, #0x1f, 0x427803c <_ChromeMain+0x4272da0>
 4278144: f9400be0     	ldr	x0, [sp, #0x10]
 4278148: f94013e8     	ldr	x8, [sp, #0x20]
 427814c: 17ffffba     	b	0x4278034 <_ChromeMain+0x4272d98>
 4278150: f9400008     	ldr	x8, [x0]
 4278154: f9400d08     	ldr	x8, [x8, #0x18]
 4278158: d63f0100     	blr	x8
 427815c: aa1303e8     	mov	x8, x19
 4278160: aa1403e0     	mov	x0, x20
 4278164: 94a7fe8d     	bl	0x6c77b98 <_ChromeMain+0x6c728fc>
 4278168: f0014fe8     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 427816c: 91397108     	add	x8, x8, #0xe5c
 4278170: a93c7fa8     	stp	x8, xzr, [x29, #-0x40]
 4278174: f90027f4     	str	x20, [sp, #0x48]
 4278178: b000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 427817c: 91120000     	add	x0, x0, #0x480
 4278180: d10103a1     	sub	x1, x29, #0x40
 4278184: 910123e2     	add	x2, sp, #0x48
 4278188: 94a80294     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 427818c: f9000660     	str	x0, [x19, #0x8]
 4278190: 52800028     	mov	w8, #0x1                ; =1
 4278194: 39004268     	strb	w8, [x19, #0x10]
 4278198: 17ffffa9     	b	0x427803c <_ChromeMain+0x4272da0>
 427819c: d4200020     	brk	#0x1
 42781a0: b0055675     	adrp	x21, 0xed45000 <dyld_stub_binder+0xed45000>
 42781a4: 910c22b5     	add	x21, x21, #0x308
 42781a8: aa1503e0     	mov	x0, x21
 42781ac: aa0803f6     	mov	x22, x8
 42781b0: 94f631c4     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 42781b4: aa1603e8     	mov	x8, x22
 42781b8: 34ffee60     	cbz	w0, 0x4277f84 <_ChromeMain+0x4272ce8>
 42781bc: b0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42781c0: 910bc108     	add	x8, x8, #0x2f0
 42781c4: f900091f     	str	xzr, [x8, #0x10]
 42781c8: aa0803e9     	mov	x9, x8
 42781cc: f8008d3f     	str	xzr, [x9, #0x8]!
 42781d0: f9000109     	str	x9, [x8]
 42781d4: 52800037     	mov	w23, #0x1               ; =1
 42781d8: 089ffeb7     	stlrb	w23, [x21]
 42781dc: f0055380     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42781e0: 9127c000     	add	x0, x0, #0x9f0
 42781e4: 94f631ba     	bl	0x80048cc <_ChromeMain+0x7fff630>
 42781e8: 350003a0     	cbnz	w0, 0x427825c <_ChromeMain+0x4272fc0>
 42781ec: b0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42781f0: 394c2515     	ldrb	w21, [x8, #0x309]
 42781f4: 390c2517     	strb	w23, [x8, #0x309]
 42781f8: f0055380     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 42781fc: 9127c000     	add	x0, x0, #0x9f0
 4278200: 94f631c1     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4278204: 350001c0     	cbnz	w0, 0x427823c <_ChromeMain+0x4272fa0>
 4278208: aa1603e8     	mov	x8, x22
 427820c: 3617ebd5     	tbz	w21, #0x2, 0x4277f84 <_ChromeMain+0x4272ce8>
 4278210: f0055380     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 4278214: 9128c000     	add	x0, x0, #0xa30
 4278218: 94f631be     	bl	0x8004910 <_ChromeMain+0x7fff674>
 427821c: aa1603e8     	mov	x8, x22
 4278220: 34ffeb20     	cbz	w0, 0x4277f84 <_ChromeMain+0x4272ce8>
 4278224: 9004e3e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4278228: 911c4d08     	add	x8, x8, #0x713
 427822c: f90003e8     	str	x8, [sp]
 4278230: 9004e3e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4278234: 911c9c00     	add	x0, x0, #0x727
 4278238: 94f631b9     	bl	0x800491c <_ChromeMain+0x7fff680>
 427823c: 9004e3e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4278240: 911c4d08     	add	x8, x8, #0x713
 4278244: f90003e8     	str	x8, [sp]
 4278248: 9004e3e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 427824c: 911be000     	add	x0, x0, #0x6f8
 4278250: 94f631b3     	bl	0x800491c <_ChromeMain+0x7fff680>
 4278254: 17ffffd2     	b	0x427819c <_ChromeMain+0x4272f00>
 4278258: 94f6321b     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 427825c: 9004e3e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 4278260: 911c4d08     	add	x8, x8, #0x713
 4278264: f90003e8     	str	x8, [sp]
 4278268: 9004e3e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 427826c: 911b7400     	add	x0, x0, #0x6dd
 4278270: 94f631ab     	bl	0x800491c <_ChromeMain+0x7fff680>
