
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4244d38: d10243ff     	sub	sp, sp, #0x90
 4244d3c: a9036ffc     	stp	x28, x27, [sp, #0x30]
 4244d40: a90467fa     	stp	x26, x25, [sp, #0x40]
 4244d44: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4244d48: a90657f6     	stp	x22, x21, [sp, #0x60]
 4244d4c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4244d50: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4244d54: 910203fd     	add	x29, sp, #0x80
 4244d58: aa0003f3     	mov	x19, x0
 4244d5c: f941c800     	ldr	x0, [x0, #0x390]
 4244d60: b40000a0     	cbz	x0, 0x4244d74 <_ChromeMain+0x423fad8>
 4244d64: f9400008     	ldr	x8, [x0]
 4244d68: f9405108     	ldr	x8, [x8, #0xa0]
 4244d6c: 52800001     	mov	w1, #0x0                ; =0
 4244d70: d63f0100     	blr	x8
 4244d74: f941d274     	ldr	x20, [x19, #0x3a0]
 4244d78: b4000cf4     	cbz	x20, 0x4244f14 <_ChromeMain+0x423fc78>
 4244d7c: f941f668     	ldr	x8, [x19, #0x3e8]
 4244d80: b4000e28     	cbz	x8, 0x4244f44 <_ChromeMain+0x423fca8>
 4244d84: d2e14008     	mov	x8, #0xa00000000000000  ; =720575940379279360
 4244d88: f9000be8     	str	x8, [sp, #0x10]
 4244d8c: 910003e9     	mov	x9, sp
 4244d90: 9100512a     	add	x10, x9, #0x14
 4244d94: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4244d98: 91194108     	add	x8, x8, #0x650
 4244d9c: eb08015f     	cmp	x10, x8
 4244da0: fa488122     	ccmp	x9, x8, #0x2, hi
 4244da4: 54001749     	b.ls	0x424508c <_ChromeMain+0x423fdf0>
 4244da8: 910fa276     	add	x22, x19, #0x3e8
 4244dac: 528005c9     	mov	w9, #0x2e               ; =46
 4244db0: 72a005c9     	movk	w9, #0x2e, lsl #16
 4244db4: b90013e9     	str	w9, [sp, #0x10]
 4244db8: 3dc00100     	ldr	q0, [x8]
 4244dbc: 3d8003e0     	str	q0, [sp]
 4244dc0: d004e9a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4244dc4: 91062821     	add	x1, x1, #0x18a
 4244dc8: 910003e0     	mov	x0, sp
 4244dcc: 52800042     	mov	w2, #0x2                ; =2
 4244dd0: 97274586     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4244dd4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4244dd8: d0054b77     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4244ddc: f94046e9     	ldr	x9, [x23, #0x88]
 4244de0: eb09011f     	cmp	x8, x9
 4244de4: 54000061     	b.ne	0x4244df0 <_ChromeMain+0x423fb54>
 4244de8: 910fa260     	add	x0, x19, #0x3e8
 4244dec: 96f73d44     	bl	0x142fc <_ChromeMain+0xf060>
 4244df0: d280001b     	mov	x27, #0x0               ; =0
 4244df4: d346ff68     	lsr	x8, x27, #6
 4244df8: f8687ac8     	ldr	x8, [x22, x8, lsl #3]
 4244dfc: 9adb2508     	lsr	x8, x8, x27
 4244e00: 37000da8     	tbnz	w8, #0x0, 0x4244fb4 <_ChromeMain+0x423fd18>
 4244e04: 9100077b     	add	x27, x27, #0x1
 4244e08: f1010f7f     	cmp	x27, #0x43
 4244e0c: 54ffff41     	b.ne	0x4244df4 <_ChromeMain+0x423fb58>
 4244e10: d2800018     	mov	x24, #0x0               ; =0
 4244e14: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4244e18: f94046e9     	ldr	x9, [x23, #0x88]
 4244e1c: eb09011f     	cmp	x8, x9
 4244e20: 54000061     	b.ne	0x4244e2c <_ChromeMain+0x423fb90>
 4244e24: 910fa260     	add	x0, x19, #0x3e8
 4244e28: 96f77705     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4244e2c: 3dc002c0     	ldr	q0, [x22]
 4244e30: 9004e7e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4244e34: 3dc32101     	ldr	q1, [x8, #0xc80]
 4244e38: 4e211c00     	and.16b	v0, v0, v1
 4244e3c: 4e205800     	cnt.16b	v0, v0
 4244e40: 4f00e421     	movi.16b	v1, #0x1
 4244e44: 6f00e402     	movi.2d	v2, #0000000000000000
 4244e48: 6e809422     	udot.4s	v2, v1, v0
 4244e4c: 6eb03840     	uaddlv.4s	d0, v2
 4244e50: 9e660008     	fmov	x8, d0
 4244e54: eb180115     	subs	x21, x8, x24
 4244e58: 54000300     	b.eq	0x4244eb8 <_ChromeMain+0x423fc1c>
 4244e5c: d004e9a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4244e60: 91065821     	add	x1, x1, #0x196
 4244e64: 910003e0     	mov	x0, sp
 4244e68: 52800042     	mov	w2, #0x2                ; =2
 4244e6c: 9727455f     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4244e70: 910063f6     	add	x22, sp, #0x18
 4244e74: 910063e8     	add	x8, sp, #0x18
 4244e78: aa1503e0     	mov	x0, x21
 4244e7c: 9516a3c3     	bl	0x87edd88 <_ChromeMain+0x87e8aec>
 4244e80: 3980bfe8     	ldrsb	x8, [sp, #0x2f]
 4244e84: a941abe9     	ldp	x9, x10, [sp, #0x18]
 4244e88: f100011f     	cmp	x8, #0x0
 4244e8c: 9a964121     	csel	x1, x9, x22, mi
 4244e90: 7100011f     	cmp	w8, #0x0
 4244e94: 9a884142     	csel	x2, x10, x8, mi
 4244e98: 910003e0     	mov	x0, sp
 4244e9c: 97274553     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4244ea0: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4244ea4: 36f800a8     	tbz	w8, #0x1f, 0x4244eb8 <_ChromeMain+0x423fc1c>
 4244ea8: f9400fe0     	ldr	x0, [sp, #0x18]
 4244eac: f94017e8     	ldr	x8, [sp, #0x28]
 4244eb0: d37ff901     	lsl	x1, x8, #1
 4244eb4: 96f71001     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244eb8: d004e9a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4244ebc: 91067021     	add	x1, x1, #0x19c
 4244ec0: 910003e0     	mov	x0, sp
 4244ec4: 52800022     	mov	w2, #0x1                ; =1
 4244ec8: 97274548     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4244ecc: 39405fe8     	ldrb	w8, [sp, #0x17]
 4244ed0: a9402be9     	ldp	x9, x10, [sp]
 4244ed4: 13001d0b     	sxtb	w11, w8
 4244ed8: 7100017f     	cmp	w11, #0x0
 4244edc: 910003eb     	mov	x11, sp
 4244ee0: 9a8b4121     	csel	x1, x9, x11, mi
 4244ee4: 2a0803e8     	mov	w8, w8
 4244ee8: 9a884142     	csel	x2, x10, x8, mi
 4244eec: f9400288     	ldr	x8, [x20]
 4244ef0: f941f108     	ldr	x8, [x8, #0x3e0]
 4244ef4: aa1403e0     	mov	x0, x20
 4244ef8: d63f0100     	blr	x8
 4244efc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4244f00: 36f800a8     	tbz	w8, #0x1f, 0x4244f14 <_ChromeMain+0x423fc78>
 4244f04: f94003e0     	ldr	x0, [sp]
 4244f08: f9400be8     	ldr	x8, [sp, #0x10]
 4244f0c: d37ff901     	lsl	x1, x8, #1
 4244f10: 96f70fea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4244f14: f941ce60     	ldr	x0, [x19, #0x398]
 4244f18: b5000120     	cbnz	x0, 0x4244f3c <_ChromeMain+0x423fca0>
 4244f1c: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4244f20: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4244f24: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4244f28: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4244f2c: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4244f30: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 4244f34: 910243ff     	add	sp, sp, #0x90
 4244f38: d65f03c0     	ret
 4244f3c: 95920c4f     	bl	0xa6c8078 <_ChromeMain+0xa6c2ddc>
 4244f40: 17fffff7     	b	0x4244f1c <_ChromeMain+0x423fc80>
 4244f44: 394fc268     	ldrb	w8, [x19, #0x3f0]
 4244f48: 7200091f     	tst	w8, #0x7
 4244f4c: 54fff1c1     	b.ne	0x4244d84 <_ChromeMain+0x423fae8>
 4244f50: 52800148     	mov	w8, #0xa                ; =10
 4244f54: 39005fe8     	strb	w8, [sp, #0x17]
 4244f58: 910003e9     	mov	x9, sp
 4244f5c: 9100512a     	add	x10, x9, #0x14
 4244f60: d0046608     	adrp	x8, 0xcf06000 <dyld_stub_binder+0xcf06000>
 4244f64: 91194108     	add	x8, x8, #0x650
 4244f68: eb08015f     	cmp	x10, x8
 4244f6c: fa488122     	ccmp	x9, x8, #0x2, hi
 4244f70: 540008e9     	b.ls	0x424508c <_ChromeMain+0x423fdf0>
 4244f74: 528005c9     	mov	w9, #0x2e               ; =46
 4244f78: 72a005c9     	movk	w9, #0x2e, lsl #16
 4244f7c: b90013e9     	str	w9, [sp, #0x10]
 4244f80: 3dc00100     	ldr	q0, [x8]
 4244f84: 3d8003e0     	str	q0, [sp]
 4244f88: 79002bff     	strh	wzr, [sp, #0x14]
 4244f8c: 52800148     	mov	w8, #0xa                ; =10
 4244f90: d2800a69     	mov	x9, #0x53               ; =83
 4244f94: f2a00f29     	movk	x9, #0x79, lsl #16
 4244f98: f2c00dc9     	movk	x9, #0x6e, lsl #32
 4244f9c: f2e00c69     	movk	x9, #0x63, lsl #48
 4244fa0: d2800d2a     	mov	x10, #0x69              ; =105
 4244fa4: f2a00dca     	movk	x10, #0x6e, lsl #16
 4244fa8: f2c00cea     	movk	x10, #0x67, lsl #32
 4244fac: f2e005ca     	movk	x10, #0x2e, lsl #48
 4244fb0: 17ffffc9     	b	0x4244ed4 <_ChromeMain+0x423fc38>
 4244fb4: d2800018     	mov	x24, #0x0               ; =0
 4244fb8: 910063f9     	add	x25, sp, #0x18
 4244fbc: 5280087a     	mov	w26, #0x43              ; =67
 4244fc0: d004e9b5     	adrp	x21, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4244fc4: 910642b5     	add	x21, x21, #0x190
 4244fc8: 14000006     	b	0x4244fe0 <_ChromeMain+0x423fd44>
 4244fcc: aa0903e8     	mov	x8, x9
 4244fd0: 91000718     	add	x24, x24, #0x1
 4244fd4: aa0803fb     	mov	x27, x8
 4244fd8: f1010d1f     	cmp	x8, #0x43
 4244fdc: 54fff1c0     	b.eq	0x4244e14 <_ChromeMain+0x423fb78>
 4244fe0: f100071f     	cmp	x24, #0x1
 4244fe4: 54000080     	b.eq	0x4244ff4 <_ChromeMain+0x423fd58>
 4244fe8: f1000b1f     	cmp	x24, #0x2
 4244fec: 54fff140     	b.eq	0x4244e14 <_ChromeMain+0x423fb78>
 4244ff0: 14000005     	b	0x4245004 <_ChromeMain+0x423fd68>
 4244ff4: 910003e0     	mov	x0, sp
 4244ff8: aa1503e1     	mov	x1, x21
 4244ffc: 52800042     	mov	w2, #0x2                ; =2
 4245000: 972744fa     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4245004: 11000760     	add	w0, w27, #0x1
 4245008: 97566a8e     	bl	0x17dfa40 <_ChromeMain+0x17da7a4>
 424500c: a9408409     	ldp	x9, x1, [x0, #0x8]
 4245010: 910063e8     	add	x8, sp, #0x18
 4245014: aa0903e0     	mov	x0, x9
 4245018: 971a74be     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 424501c: 3980bfe8     	ldrsb	x8, [sp, #0x2f]
 4245020: a941abe9     	ldp	x9, x10, [sp, #0x18]
 4245024: f100011f     	cmp	x8, #0x0
 4245028: 9a994121     	csel	x1, x9, x25, mi
 424502c: 7100011f     	cmp	w8, #0x0
 4245030: 9a884142     	csel	x2, x10, x8, mi
 4245034: 910003e0     	mov	x0, sp
 4245038: 972744ec     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 424503c: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4245040: 36f800a8     	tbz	w8, #0x1f, 0x4245054 <_ChromeMain+0x423fdb8>
 4245044: f9400fe0     	ldr	x0, [sp, #0x18]
 4245048: f94017e8     	ldr	x8, [sp, #0x28]
 424504c: d37ff901     	lsl	x1, x8, #1
 4245050: 96f70f9a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4245054: 91000769     	add	x9, x27, #0x1
 4245058: f1010d3f     	cmp	x9, #0x43
 424505c: 9a9b9748     	csinc	x8, x26, x27, ls
 4245060: d100050a     	sub	x10, x8, #0x1
 4245064: eb0a037f     	cmp	x27, x10
 4245068: 54fffb40     	b.eq	0x4244fd0 <_ChromeMain+0x423fd34>
 424506c: d346fd2a     	lsr	x10, x9, #6
 4245070: f86a7aca     	ldr	x10, [x22, x10, lsl #3]
 4245074: 9ac9254a     	lsr	x10, x10, x9
 4245078: 3707faaa     	tbnz	w10, #0x0, 0x4244fcc <_ChromeMain+0x423fd30>
 424507c: 91000529     	add	x9, x9, #0x1
 4245080: eb09011f     	cmp	x8, x9
 4245084: 54fffa60     	b.eq	0x4244fd0 <_ChromeMain+0x423fd34>
 4245088: 17fffff9     	b	0x424506c <_ChromeMain+0x423fdd0>
 424508c: d4200020     	brk	#0x1
 4245090: d100c3ff     	sub	sp, sp, #0x30
 4245094: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245098: a9027bfd     	stp	x29, x30, [sp, #0x20]
 424509c: 910083fd     	add	x29, sp, #0x20
 42450a0: aa0003f3     	mov	x19, x0
 42450a4: f941d408     	ldr	x8, [x0, #0x3a8]
 42450a8: b4000168     	cbz	x8, 0x42450d4 <_ChromeMain+0x423fe38>
 42450ac: f941a109     	ldr	x9, [x8, #0x340]
 42450b0: b40000c9     	cbz	x9, 0x42450c8 <_ChromeMain+0x423fe2c>
 42450b4: 3942a128     	ldrb	w8, [x9, #0xa8]
 42450b8: 340000c8     	cbz	w8, 0x42450d0 <_ChromeMain+0x423fe34>
 42450bc: a951a528     	ldp	x8, x9, [x9, #0x118]
 42450c0: 92400529     	and	x9, x9, #0x3
 42450c4: 14000005     	b	0x42450d8 <_ChromeMain+0x423fe3c>
 42450c8: d2800008     	mov	x8, #0x0                ; =0
 42450cc: 14000003     	b	0x42450d8 <_ChromeMain+0x423fe3c>
 42450d0: d2800008     	mov	x8, #0x0                ; =0
 42450d4: d2800009     	mov	x9, #0x0                ; =0
 42450d8: f941f66a     	ldr	x10, [x19, #0x3e8]
 42450dc: eb0a011f     	cmp	x8, x10
 42450e0: 54000121     	b.ne	0x4245104 <_ChromeMain+0x423fe68>
 42450e4: f941fa6a     	ldr	x10, [x19, #0x3f0]
 42450e8: 9240094a     	and	x10, x10, #0x7
 42450ec: eb09015f     	cmp	x10, x9
 42450f0: 540000a1     	b.ne	0x4245104 <_ChromeMain+0x423fe68>
 42450f4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42450f8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42450fc: 9100c3ff     	add	sp, sp, #0x30
 4245100: d65f03c0     	ret
 4245104: f901f668     	str	x8, [x19, #0x3e8]
 4245108: f901fa69     	str	x9, [x19, #0x3f0]
 424510c: aa1303e0     	mov	x0, x19
 4245110: 97ffff0a     	bl	0x4244d38 <_ChromeMain+0x423fa9c>
 4245114: f941c660     	ldr	x0, [x19, #0x388]
 4245118: f9400008     	ldr	x8, [x0]
 424511c: f9405108     	ldr	x8, [x8, #0xa0]
 4245120: 52800001     	mov	w1, #0x0                ; =0
 4245124: d63f0100     	blr	x8
 4245128: 394fe261     	ldrb	w1, [x19, #0x3f8]
 424512c: f9400268     	ldr	x8, [x19]
 4245130: f9405108     	ldr	x8, [x8, #0xa0]
 4245134: aa1303e0     	mov	x0, x19
 4245138: d63f0100     	blr	x8
 424513c: 394fe274     	ldrb	w20, [x19, #0x3f8]
 4245140: b9431a68     	ldr	w8, [x19, #0x318]
 4245144: 6b14011f     	cmp	w8, w20
 4245148: 54000301     	b.ne	0x42451a8 <_ChromeMain+0x423ff0c>
 424514c: 7200029f     	tst	w20, #0x1
 4245150: 52800068     	mov	w8, #0x3                ; =3
 4245154: 1a9f1114     	csel	w20, w8, wzr, ne
 4245158: b9432268     	ldr	w8, [x19, #0x320]
 424515c: 6b14011f     	cmp	w8, w20
 4245160: 54fffca0     	b.eq	0x42450f4 <_ChromeMain+0x423fe58>
 4245164: f9418a68     	ldr	x8, [x19, #0x310]
 4245168: b9000ff4     	str	w20, [sp, #0xc]
 424516c: 90053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4245170: 9115a021     	add	x1, x1, #0x568
 4245174: 91046100     	add	x0, x8, #0x118
 4245178: 910033e2     	add	x2, sp, #0xc
 424517c: 9760800a     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4245180: b9032274     	str	w20, [x19, #0x320]
 4245184: aa1303e0     	mov	x0, x19
 4245188: 52800021     	mov	w1, #0x1                ; =1
 424518c: 971671f6     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4245190: 9103e260     	add	x0, x19, #0xf8
 4245194: 910c8261     	add	x1, x19, #0x320
 4245198: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424519c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42451a0: 9100c3ff     	add	sp, sp, #0x30
 42451a4: 17338b8b     	b	0xf27fd0 <_ChromeMain+0xf22d34>
 42451a8: f9418a60     	ldr	x0, [x19, #0x310]
 42451ac: aa1403e1     	mov	x1, x20
 42451b0: 97e385d4     	bl	0x3b26900 <_ChromeMain+0x3b21664>
 42451b4: b9031a74     	str	w20, [x19, #0x318]
 42451b8: aa1303e0     	mov	x0, x19
 42451bc: 52800021     	mov	w1, #0x1                ; =1
 42451c0: 971671e9     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 42451c4: 9103e260     	add	x0, x19, #0xf8
 42451c8: 910c6261     	add	x1, x19, #0x318
 42451cc: 97338b81     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 42451d0: 394fe274     	ldrb	w20, [x19, #0x3f8]
 42451d4: 17ffffde     	b	0x424514c <_ChromeMain+0x423feb0>
 42451d8: d10d8000     	sub	x0, x0, #0x360
 42451dc: 17c57bcd     	b	0x33a4110 <_ChromeMain+0x339ee74>
		...
 4245200: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4245204: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4245208: 910043fd     	add	x29, sp, #0x10
 424520c: d10d8013     	sub	x19, x0, #0x360
 4245210: aa1303e0     	mov	x0, x19
 4245214: 97c57bbf     	bl	0x33a4110 <_ChromeMain+0x339ee74>
 4245218: b0056628     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 424521c: 91120108     	add	x8, x8, #0x480
 4245220: f8bfc100     	ldapr	x0, [x8]
 4245224: b40000a0     	cbz	x0, 0x4245238 <_ChromeMain+0x423ff9c>
 4245228: aa1303e1     	mov	x1, x19
 424522c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4245230: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4245234: 17345e3b     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4245238: 94023930     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 424523c: 17fffffb     	b	0x4245228 <_ChromeMain+0x423ff8c>
 4245240: 3947a408     	ldrb	w8, [x0, #0x1e9]
 4245244: 360003c8     	tbz	w8, #0x0, 0x42452bc <_ChromeMain+0x4240020>
 4245248: d100c3ff     	sub	sp, sp, #0x30
 424524c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245250: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4245254: 910083fd     	add	x29, sp, #0x20
 4245258: aa0003f3     	mov	x19, x0
 424525c: 91003fe1     	add	x1, sp, #0xf
 4245260: 97478d3d     	bl	0x1428754 <_ChromeMain+0x14234b8>
 4245264: f941ee68     	ldr	x8, [x19, #0x3d8]
 4245268: b4000228     	cbz	x8, 0x42452ac <_ChromeMain+0x4240010>
 424526c: f941c669     	ldr	x9, [x19, #0x388]
 4245270: b40001e9     	cbz	x9, 0x42452ac <_ChromeMain+0x4240010>
 4245274: f940e129     	ldr	x9, [x9, #0x1c0]
 4245278: d360fd2a     	lsr	x10, x9, #32
 424527c: 0b497d2b     	add	w11, w9, w9, lsr #31
 4245280: 13017d6b     	asr	w11, w11, #1
 4245284: 8b49fd49     	add	x9, x10, x9, lsr #63
 4245288: 13017d2a     	asr	w10, w9, #1
 424528c: 6b89057f     	cmp	w11, w9, asr #1
 4245290: 1a8ab169     	csel	w9, w11, w10, lt
 4245294: 0aa97d29     	bic	w9, w9, w9, asr #31
 4245298: 5280018a     	mov	w10, #0xc               ; =12
 424529c: 7100313f     	cmp	w9, #0xc
 42452a0: 1a8ab121     	csel	w1, w9, w10, lt
 42452a4: f9400d00     	ldr	x0, [x8, #0x18]
 42452a8: 94aeefaf     	bl	0x6e01164 <_ChromeMain+0x6dfbec8>
 42452ac: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42452b0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42452b4: 9100c3ff     	add	sp, sp, #0x30
 42452b8: d65f03c0     	ret
 42452bc: d4200000     	brk	#0
 42452c0: d4400000     	hlt	#0
 42452c4: d4200020     	brk	#0x1
 42452c8: f941d408     	ldr	x8, [x0, #0x3a8]
 42452cc: eb01011f     	cmp	x8, x1
 42452d0: 54000040     	b.eq	0x42452d8 <_ChromeMain+0x424003c>
 42452d4: d65f03c0     	ret
 42452d8: 17ffff6e     	b	0x4245090 <_ChromeMain+0x423fdf4>
 42452dc: 00000000     	udf	#0x0
 42452e0: f9402408     	ldr	x8, [x0, #0x48]
 42452e4: eb01011f     	cmp	x8, x1
 42452e8: 54000040     	b.eq	0x42452f0 <_ChromeMain+0x4240054>
 42452ec: d65f03c0     	ret
 42452f0: d10d8000     	sub	x0, x0, #0x360
 42452f4: 17ffff67     	b	0x4245090 <_ChromeMain+0x423fdf4>
 42452f8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 42452fc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245300: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4245304: 910083fd     	add	x29, sp, #0x20
 4245308: f941d408     	ldr	x8, [x0, #0x3a8]
 424530c: eb01011f     	cmp	x8, x1
 4245310: 540000a0     	b.eq	0x4245324 <_ChromeMain+0x4240088>
 4245314: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4245318: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 424531c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4245320: d65f03c0     	ret
 4245324: aa0003f3     	mov	x19, x0
 4245328: f941dc14     	ldr	x20, [x0, #0x3b8]
 424532c: b0054b75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4245330: b40001b4     	cbz	x20, 0x4245364 <_ChromeMain+0x42400c8>
 4245334: f901de7f     	str	xzr, [x19, #0x3b8]
 4245338: 39530288     	ldrb	w8, [x20, #0x4c0]
 424533c: 360002c8     	tbz	w8, #0x0, 0x4245394 <_ChromeMain+0x42400f8>
 4245340: f941da61     	ldr	x1, [x19, #0x3b0]
 4245344: 91122280     	add	x0, x20, #0x488
 4245348: 9765a07e     	bl	0x1bad540 <_ChromeMain+0x1ba82a4>
 424534c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4245350: f94046a9     	ldr	x9, [x21, #0x88]
 4245354: eb09011f     	cmp	x8, x9
 4245358: 54000061     	b.ne	0x4245364 <_ChromeMain+0x42400c8>
 424535c: aa1403e0     	mov	x0, x20
 4245360: 96f775b7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4245364: f941d660     	ldr	x0, [x19, #0x3a8]
 4245368: 925e7408     	and	x8, x0, #0xfffffffc00000000
 424536c: f94046a9     	ldr	x9, [x21, #0x88]
 4245370: eb09011f     	cmp	x8, x9
 4245374: 54000041     	b.ne	0x424537c <_ChromeMain+0x42400e0>
 4245378: 96f775b1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 424537c: f901d67f     	str	xzr, [x19, #0x3a8]
 4245380: aa1303e0     	mov	x0, x19
 4245384: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4245388: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 424538c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4245390: 17ffff40     	b	0x4245090 <_ChromeMain+0x423fdf4>
 4245394: d4200000     	brk	#0
 4245398: d4400000     	hlt	#0
 424539c: d4200020     	brk	#0x1
 42453a0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 42453a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 42453a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42453ac: 910083fd     	add	x29, sp, #0x20
 42453b0: f9402408     	ldr	x8, [x0, #0x48]
 42453b4: eb01011f     	cmp	x8, x1
 42453b8: 540000a0     	b.eq	0x42453cc <_ChromeMain+0x4240130>
 42453bc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42453c0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42453c4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 42453c8: d65f03c0     	ret
 42453cc: aa0003f3     	mov	x19, x0
 42453d0: f9402c14     	ldr	x20, [x0, #0x58]
 42453d4: b0054b75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42453d8: b40001b4     	cbz	x20, 0x424540c <_ChromeMain+0x4240170>
 42453dc: f9002e7f     	str	xzr, [x19, #0x58]
 42453e0: 39530288     	ldrb	w8, [x20, #0x4c0]
 42453e4: 360002e8     	tbz	w8, #0x0, 0x4245440 <_ChromeMain+0x42401a4>
 42453e8: f9402a61     	ldr	x1, [x19, #0x50]
 42453ec: 91122280     	add	x0, x20, #0x488
 42453f0: 9765a054     	bl	0x1bad540 <_ChromeMain+0x1ba82a4>
 42453f4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 42453f8: f94046a9     	ldr	x9, [x21, #0x88]
 42453fc: eb09011f     	cmp	x8, x9
 4245400: 54000061     	b.ne	0x424540c <_ChromeMain+0x4240170>
 4245404: aa1403e0     	mov	x0, x20
 4245408: 96f7758d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 424540c: d10d8274     	sub	x20, x19, #0x360
 4245410: f9402660     	ldr	x0, [x19, #0x48]
 4245414: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4245418: f94046a9     	ldr	x9, [x21, #0x88]
 424541c: eb09011f     	cmp	x8, x9
 4245420: 54000041     	b.ne	0x4245428 <_ChromeMain+0x424018c>
 4245424: 96f77586     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4245428: f900267f     	str	xzr, [x19, #0x48]
 424542c: aa1403e0     	mov	x0, x20
 4245430: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4245434: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4245438: a8c357f6     	ldp	x22, x21, [sp], #0x30
 424543c: 17ffff15     	b	0x4245090 <_ChromeMain+0x423fdf4>
 4245440: d4200000     	brk	#0
 4245444: d4400000     	hlt	#0
 4245448: d4200020     	brk	#0x1
 424544c: d100c3ff     	sub	sp, sp, #0x30
 4245450: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245454: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4245458: 910083fd     	add	x29, sp, #0x20
 424545c: 394fe008     	ldrb	w8, [x0, #0x3f8]
 4245460: 6b01011f     	cmp	w8, w1
 4245464: 540000a1     	b.ne	0x4245478 <_ChromeMain+0x42401dc>
 4245468: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424546c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4245470: 9100c3ff     	add	sp, sp, #0x30
 4245474: d65f03c0     	ret
 4245478: aa0003f3     	mov	x19, x0
 424547c: 390fe001     	strb	w1, [x0, #0x3f8]
 4245480: 97fffe2e     	bl	0x4244d38 <_ChromeMain+0x423fa9c>
 4245484: f941c660     	ldr	x0, [x19, #0x388]
 4245488: f9400008     	ldr	x8, [x0]
 424548c: f9405108     	ldr	x8, [x8, #0xa0]
 4245490: 52800001     	mov	w1, #0x0                ; =0
 4245494: d63f0100     	blr	x8
 4245498: 394fe261     	ldrb	w1, [x19, #0x3f8]
 424549c: f9400268     	ldr	x8, [x19]
 42454a0: f9405108     	ldr	x8, [x8, #0xa0]
 42454a4: aa1303e0     	mov	x0, x19
 42454a8: d63f0100     	blr	x8
 42454ac: 394fe274     	ldrb	w20, [x19, #0x3f8]
 42454b0: b9431a68     	ldr	w8, [x19, #0x318]
 42454b4: 6b14011f     	cmp	w8, w20
 42454b8: 54000301     	b.ne	0x4245518 <_ChromeMain+0x424027c>
 42454bc: 7200029f     	tst	w20, #0x1
 42454c0: 52800068     	mov	w8, #0x3                ; =3
 42454c4: 1a9f1114     	csel	w20, w8, wzr, ne
 42454c8: b9432268     	ldr	w8, [x19, #0x320]
 42454cc: 6b14011f     	cmp	w8, w20
 42454d0: 54fffcc0     	b.eq	0x4245468 <_ChromeMain+0x42401cc>
 42454d4: f9418a68     	ldr	x8, [x19, #0x310]
 42454d8: b9000ff4     	str	w20, [sp, #0xc]
 42454dc: 90053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 42454e0: 9115a021     	add	x1, x1, #0x568
 42454e4: 91046100     	add	x0, x8, #0x118
 42454e8: 910033e2     	add	x2, sp, #0xc
 42454ec: 97607f2e     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 42454f0: b9032274     	str	w20, [x19, #0x320]
 42454f4: aa1303e0     	mov	x0, x19
 42454f8: 52800021     	mov	w1, #0x1                ; =1
 42454fc: 9716711a     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4245500: 9103e260     	add	x0, x19, #0xf8
 4245504: 910c8261     	add	x1, x19, #0x320
 4245508: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424550c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4245510: 9100c3ff     	add	sp, sp, #0x30
 4245514: 17338aaf     	b	0xf27fd0 <_ChromeMain+0xf22d34>
 4245518: f9418a60     	ldr	x0, [x19, #0x310]
 424551c: aa1403e1     	mov	x1, x20
 4245520: 97e384f8     	bl	0x3b26900 <_ChromeMain+0x3b21664>
 4245524: b9031a74     	str	w20, [x19, #0x318]
 4245528: aa1303e0     	mov	x0, x19
 424552c: 52800021     	mov	w1, #0x1                ; =1
 4245530: 9716710d     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4245534: 9103e260     	add	x0, x19, #0xf8
 4245538: 910c6261     	add	x1, x19, #0x318
 424553c: 97338aa5     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4245540: 394fe274     	ldrb	w20, [x19, #0x3f8]
 4245544: 17ffffde     	b	0x42454bc <_ChromeMain+0x4240220>
		...
 4245580: 39502408     	ldrb	w8, [x0, #0x409]
 4245584: 35000068     	cbnz	w8, 0x4245590 <_ChromeMain+0x42402f4>
 4245588: 52800000     	mov	w0, #0x0                ; =0
 424558c: d65f03c0     	ret
 4245590: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 4245594: 910003fd     	mov	x29, sp
 4245598: f9400008     	ldr	x8, [x0]
 424559c: f9422108     	ldr	x8, [x8, #0x440]
 42455a0: d63f0100     	blr	x8
 42455a4: 528000a8     	mov	w8, #0x5                ; =5
 42455a8: 52800129     	mov	w9, #0x9                ; =9
 42455ac: 7100001f     	cmp	w0, #0x0
