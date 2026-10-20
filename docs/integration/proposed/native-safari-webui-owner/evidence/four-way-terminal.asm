
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4251b94: d10483ff     	sub	sp, sp, #0x120
 4251b98: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 4251b9c: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 4251ba0: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4251ba4: a9117bfd     	stp	x29, x30, [sp, #0x110]
 4251ba8: 910443fd     	add	x29, sp, #0x110
 4251bac: f004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4251bb0: f940f908     	ldr	x8, [x8, #0x1f0]
 4251bb4: f9400108     	ldr	x8, [x8]
 4251bb8: f81c83a8     	stur	x8, [x29, #-0x38]
 4251bbc: 39422008     	ldrb	w8, [x0, #0x88]
 4251bc0: 34000148     	cbz	w8, 0x4251be8 <_ChromeMain+0x424c94c>
 4251bc4: aa0003f3     	mov	x19, x0
 4251bc8: 39421008     	ldrb	w8, [x0, #0x84]
 4251bcc: 340000e8     	cbz	w8, 0x4251be8 <_ChromeMain+0x424c94c>
 4251bd0: 39421668     	ldrb	w8, [x19, #0x85]
 4251bd4: 340000a8     	cbz	w8, 0x4251be8 <_ChromeMain+0x424c94c>
 4251bd8: 39421a68     	ldrb	w8, [x19, #0x86]
 4251bdc: 34000068     	cbz	w8, 0x4251be8 <_ChromeMain+0x424c94c>
 4251be0: 39421e68     	ldrb	w8, [x19, #0x87]
 4251be4: 350003a8     	cbnz	w8, 0x4251c58 <_ChromeMain+0x424c9bc>
 4251be8: f85c83a8     	ldur	x8, [x29, #-0x38]
 4251bec: f004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4251bf0: f940f929     	ldr	x9, [x9, #0x1f0]
 4251bf4: f9400129     	ldr	x9, [x9]
 4251bf8: eb08013f     	cmp	x9, x8
 4251bfc: 540021c1     	b.ne	0x4252034 <_ChromeMain+0x424cd98>
 4251c00: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 4251c04: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 4251c08: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 4251c0c: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 4251c10: 910483ff     	add	sp, sp, #0x120
 4251c14: d65f03c0     	ret
 4251c18: 94d3efa9     	bl	0x774dabc <_ChromeMain+0x7748820>
 4251c1c: 52805801     	mov	w1, #0x2c0              ; =704
 4251c20: 96f6dca6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251c24: 14000019     	b	0x4251c88 <_ChromeMain+0x424c9ec>
 4251c28: a9450a61     	ldp	x1, x2, [x19, #0x50]
 4251c2c: 9100c3e0     	add	x0, sp, #0x30
 4251c30: 96f7197a     	bl	0x18218 <_ChromeMain+0x12f7c>
 4251c34: 14000012     	b	0x4251c7c <_ChromeMain+0x424c9e0>
 4251c38: f9403668     	ldr	x8, [x19, #0x68]
 4251c3c: 7900011f     	strh	wzr, [x8]
 4251c40: f9003a7f     	str	xzr, [x19, #0x70]
 4251c44: 1400002d     	b	0x4251cf8 <_ChromeMain+0x424ca5c>
 4251c48: f9402a68     	ldr	x8, [x19, #0x50]
 4251c4c: 3900011f     	strb	wzr, [x8]
 4251c50: f9002e7f     	str	xzr, [x19, #0x58]
 4251c54: 14000025     	b	0x4251ce8 <_ChromeMain+0x424ca4c>
 4251c58: b9404a75     	ldr	w21, [x19, #0x48]
 4251c5c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4251c60: f90023ff     	str	xzr, [sp, #0x40]
 4251c64: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4251c68: 37fffe08     	tbnz	w8, #0x1f, 0x4251c28 <_ChromeMain+0x424c98c>
 4251c6c: 3cc50260     	ldur	q0, [x19, #0x50]
 4251c70: 3d800fe0     	str	q0, [sp, #0x30]
 4251c74: f8460268     	ldur	x8, [x19, #0x60]
 4251c78: f90023e8     	str	x8, [sp, #0x40]
 4251c7c: f9401660     	ldr	x0, [x19, #0x28]
 4251c80: f900167f     	str	xzr, [x19, #0x28]
 4251c84: b5fffca0     	cbnz	x0, 0x4251c18 <_ChromeMain+0x424c97c>
 4251c88: f9401260     	ldr	x0, [x19, #0x20]
 4251c8c: f900127f     	str	xzr, [x19, #0x20]
 4251c90: b4000080     	cbz	x0, 0x4251ca0 <_ChromeMain+0x424ca04>
 4251c94: 97b84965     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4251c98: 52802f01     	mov	w1, #0x178              ; =376
 4251c9c: 96f6dc87     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251ca0: 3902227f     	strb	wzr, [x19, #0x88]
 4251ca4: f900427f     	str	xzr, [x19, #0x80]
 4251ca8: f9401e68     	ldr	x8, [x19, #0x38]
 4251cac: d37ef509     	lsl	x9, x8, #2
 4251cb0: b4000129     	cbz	x9, 0x4251cd4 <_ChromeMain+0x424ca38>
 4251cb4: f9401a6a     	ldr	x10, [x19, #0x30]
 4251cb8: cb080be8     	neg	x8, x8, lsl #2
 4251cbc: 8b0a0129     	add	x9, x9, x10
 4251cc0: d1001129     	sub	x9, x9, #0x4
 4251cc4: b4001329     	cbz	x9, 0x4251f28 <_ChromeMain+0x424cc8c>
 4251cc8: d1001129     	sub	x9, x9, #0x4
 4251ccc: 91001108     	add	x8, x8, #0x4
 4251cd0: b5ffffa8     	cbnz	x8, 0x4251cc4 <_ChromeMain+0x424ca28>
 4251cd4: f9001e7f     	str	xzr, [x19, #0x38]
 4251cd8: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4251cdc: 37fffb68     	tbnz	w8, #0x1f, 0x4251c48 <_ChromeMain+0x424c9ac>
 4251ce0: 3901427f     	strb	wzr, [x19, #0x50]
 4251ce4: 39019e7f     	strb	wzr, [x19, #0x67]
 4251ce8: 39c1fe68     	ldrsb	w8, [x19, #0x7f]
 4251cec: 37fffa68     	tbnz	w8, #0x1f, 0x4251c38 <_ChromeMain+0x424c99c>
 4251cf0: 7900d27f     	strh	wzr, [x19, #0x68]
 4251cf4: 3901fe7f     	strb	wzr, [x19, #0x7f]
 4251cf8: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4251cfc: f9400a68     	ldr	x8, [x19, #0x10]
 4251d00: b4000548     	cbz	x8, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d04: f9403100     	ldr	x0, [x8, #0x60]
 4251d08: b4000500     	cbz	x0, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d0c: b00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4251d10: f9467d08     	ldr	x8, [x8, #0xcf8]
 4251d14: f9414908     	ldr	x8, [x8, #0x290]
 4251d18: f9400514     	ldr	x20, [x8, #0x8]
 4251d1c: 970d39f6     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4251d20: b4000440     	cbz	x0, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d24: f9402808     	ldr	x8, [x0, #0x50]
 4251d28: b5000068     	cbnz	x8, 0x4251d34 <_ChromeMain+0x424ca98>
 4251d2c: f9402409     	ldr	x9, [x0, #0x48]
 4251d30: b40003c9     	cbz	x9, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d34: 52800a09     	mov	w9, #0x50               ; =80
 4251d38: 5280090a     	mov	w10, #0x48              ; =72
 4251d3c: f100011f     	cmp	x8, #0x0
 4251d40: 9a890148     	csel	x8, x10, x9, eq
 4251d44: f8686808     	ldr	x8, [x0, x8]
 4251d48: f9400908     	ldr	x8, [x8, #0x10]
 4251d4c: f9400516     	ldr	x22, [x8, #0x8]
 4251d50: b40002d6     	cbz	x22, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d54: 9100a2c8     	add	x8, x22, #0x28
 4251d58: 3901a3ff     	strb	wzr, [sp, #0x68]
 4251d5c: 9101a3e9     	add	x9, sp, #0x68
 4251d60: a93923a9     	stp	x9, x8, [x29, #-0x70]
 4251d64: 90fe5b02     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4251d68: 912dc042     	add	x2, x2, #0xb70
 4251d6c: d101c3a1     	sub	x1, x29, #0x70
 4251d70: aa1403e0     	mov	x0, x20
 4251d74: 52800003     	mov	w3, #0x0                ; =0
 4251d78: 52800004     	mov	w4, #0x0                ; =0
 4251d7c: 972d7ebd     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4251d80: 3941a3e8     	ldrb	w8, [sp, #0x68]
 4251d84: 34000128     	cbz	w8, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d88: f9403ec0     	ldr	x0, [x22, #0x78]
 4251d8c: b40000e0     	cbz	x0, 0x4251da8 <_ChromeMain+0x424cb0c>
 4251d90: f9400008     	ldr	x8, [x0]
 4251d94: f9401109     	ldr	x9, [x8, #0x20]
 4251d98: 910083e8     	add	x8, sp, #0x20
 4251d9c: d63f0120     	blr	x9
 4251da0: f94013e0     	ldr	x0, [sp, #0x20]
 4251da4: 14000005     	b	0x4251db8 <_ChromeMain+0x424cb1c>
 4251da8: 52800100     	mov	w0, #0x8                ; =8
 4251dac: 96f6f56f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4251db0: f900001f     	str	xzr, [x0]
 4251db4: a9027fe0     	stp	x0, xzr, [sp, #0x20]
 4251db8: 951068d5     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4251dbc: aa0003f4     	mov	x20, x0
 4251dc0: 94f6c667     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4251dc4: b40005b4     	cbz	x20, 0x4251e78 <_ChromeMain+0x424cbdc>
 4251dc8: 52800100     	mov	w0, #0x8                ; =8
 4251dcc: 96f6f567     	bl	0xf368 <_ChromeMain+0xa0cc>
 4251dd0: aa0003f3     	mov	x19, x0
 4251dd4: f900001f     	str	xzr, [x0]
 4251dd8: 340007f5     	cbz	w21, 0x4251ed4 <_ChromeMain+0x424cc38>
 4251ddc: f90003f3     	str	x19, [sp]
 4251de0: f94013e0     	ldr	x0, [sp, #0x20]
 4251de4: 951068ca     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4251de8: aa0003f4     	mov	x20, x0
 4251dec: aa1303e0     	mov	x0, x19
 4251df0: aa1403e1     	mov	x1, x20
 4251df4: 951068c3     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4251df8: aa1403e0     	mov	x0, x20
 4251dfc: 94f6c658     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4251e00: f94017e8     	ldr	x8, [sp, #0x28]
 4251e04: f90007e8     	str	x8, [sp, #0x8]
 4251e08: b004e941     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4251e0c: 910de021     	add	x1, x1, #0x378
 4251e10: 910003e0     	mov	x0, sp
 4251e14: 528000c2     	mov	w2, #0x6                ; =6
 4251e18: 940cee40     	bl	0x458d718 <_ChromeMain+0x458847c>
 4251e1c: f94003f3     	ldr	x19, [sp]
 4251e20: f90003ff     	str	xzr, [sp]
 4251e24: b40000d3     	cbz	x19, 0x4251e3c <_ChromeMain+0x424cba0>
 4251e28: aa1303e0     	mov	x0, x19
 4251e2c: 951068bb     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4251e30: aa1303e0     	mov	x0, x19
 4251e34: 52800101     	mov	w1, #0x8                ; =8
 4251e38: 96f6dc20     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251e3c: f94013f3     	ldr	x19, [sp, #0x20]
 4251e40: f90013ff     	str	xzr, [sp, #0x20]
 4251e44: b40000d3     	cbz	x19, 0x4251e5c <_ChromeMain+0x424cbc0>
 4251e48: aa1303e0     	mov	x0, x19
 4251e4c: 951068b3     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4251e50: aa1303e0     	mov	x0, x19
 4251e54: 52800101     	mov	w1, #0x8                ; =8
 4251e58: 96f6dc18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251e5c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4251e60: 36ffec48     	tbz	w8, #0x1f, 0x4251be8 <_ChromeMain+0x424c94c>
 4251e64: f9401be0     	ldr	x0, [sp, #0x30]
 4251e68: f94023e8     	ldr	x8, [sp, #0x40]
 4251e6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251e70: 96f6dc12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251e74: 17ffff5d     	b	0x4251be8 <_ChromeMain+0x424c94c>
 4251e78: 35000295     	cbnz	w21, 0x4251ec8 <_ChromeMain+0x424cc2c>
 4251e7c: 52800600     	mov	w0, #0x30               ; =48
 4251e80: 96f6f53a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4251e84: aa0003e2     	mov	x2, x0
 4251e88: 52800028     	mov	w8, #0x1                ; =1
 4251e8c: b9000008     	str	w8, [x0]
 4251e90: d0ff1068     	adrp	x8, 0x245f000 <_ChromeMain+0x2459d64>
 4251e94: 91050108     	add	x8, x8, #0x140
 4251e98: b0fedee9     	adrp	x9, 0x1e2e000 <_ChromeMain+0x1e28d64>
 4251e9c: 913c0129     	add	x9, x9, #0xf00
 4251ea0: a900a408     	stp	x8, x9, [x0, #0x8]
 4251ea4: 90ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4251ea8: 912c0108     	add	x8, x8, #0xb00
 4251eac: 10000c69     	adr	x9, 0x4252038 <_ChromeMain+0x424cd9c>
 4251eb0: d503201f     	nop
 4251eb4: a901a408     	stp	x8, x9, [x0, #0x18]
 4251eb8: 9100c3e0     	add	x0, sp, #0x30
 4251ebc: 52800001     	mov	w1, #0x0                ; =0
 4251ec0: 52800003     	mov	w3, #0x0                ; =0
 4251ec4: 94e1e306     	bl	0x7acaadc <_ChromeMain+0x7ac5840>
 4251ec8: f9400a73     	ldr	x19, [x19, #0x10]
 4251ecc: b4fffb93     	cbz	x19, 0x4251e3c <_ChromeMain+0x424cba0>
 4251ed0: 14000017     	b	0x4251f2c <_ChromeMain+0x424cc90>
 4251ed4: f9000bf3     	str	x19, [sp, #0x10]
 4251ed8: f94013e0     	ldr	x0, [sp, #0x20]
 4251edc: 9510688c     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4251ee0: aa0003f4     	mov	x20, x0
 4251ee4: aa1303e0     	mov	x0, x19
 4251ee8: aa1403e1     	mov	x1, x20
 4251eec: 95106885     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4251ef0: aa1403e0     	mov	x0, x20
 4251ef4: 94f6c61a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4251ef8: f94017e8     	ldr	x8, [sp, #0x28]
 4251efc: f9000fe8     	str	x8, [sp, #0x18]
 4251f00: b004e941     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4251f04: 910de021     	add	x1, x1, #0x378
 4251f08: 910043e0     	add	x0, sp, #0x10
 4251f0c: 9100c3e3     	add	x3, sp, #0x30
 4251f10: 528000c2     	mov	w2, #0x6                ; =6
 4251f14: 940ceda7     	bl	0x458d5b0 <_ChromeMain+0x4588314>
 4251f18: f9400bf3     	ldr	x19, [sp, #0x10]
 4251f1c: f9000bff     	str	xzr, [sp, #0x10]
 4251f20: b4fff8f3     	cbz	x19, 0x4251e3c <_ChromeMain+0x424cba0>
 4251f24: 17ffffc1     	b	0x4251e28 <_ChromeMain+0x424cb8c>
 4251f28: d4200020     	brk	#0x1
 4251f2c: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251f30: 91071c21     	add	x1, x1, #0x1c7
 4251f34: 9101a3e0     	add	x0, sp, #0x68
 4251f38: 979c7fea     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251f3c: 910223e0     	add	x0, sp, #0x88
 4251f40: 9101a3e1     	add	x1, sp, #0x68
 4251f44: 9779373b     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251f48: f00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4251f4c: 91031021     	add	x1, x1, #0xc4
 4251f50: 910123e0     	add	x0, sp, #0x48
 4251f54: 979c7fe3     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251f58: d101c3a8     	sub	x8, x29, #0x70
 4251f5c: a93b7fbf     	stp	xzr, xzr, [x29, #-0x50]
 4251f60: 3cc883e0     	ldur	q0, [sp, #0x88]
 4251f64: 3c9903a0     	stur	q0, [x29, #-0x70]
 4251f68: f9404fe9     	ldr	x9, [sp, #0x98]
 4251f6c: a93a7fa9     	stp	x9, xzr, [x29, #-0x60]
 4251f70: 91006100     	add	x0, x8, #0x18
 4251f74: 910123e1     	add	x1, sp, #0x48
 4251f78: 9779372e     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251f7c: b004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4251f80: 911e5021     	add	x1, x1, #0x794
 4251f84: d101c3a3     	sub	x3, x29, #0x70
 4251f88: aa1303e0     	mov	x0, x19
 4251f8c: 52800302     	mov	w2, #0x18               ; =24
 4251f90: 52800044     	mov	w4, #0x2                ; =2
 4251f94: 949d81f0     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 4251f98: 394183e8     	ldrb	w8, [sp, #0x60]
 4251f9c: 90053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4251fa0: 9121e273     	add	x19, x19, #0x878
 4251fa4: 7103fd1f     	cmp	w8, #0xff
 4251fa8: 54000060     	b.eq	0x4251fb4 <_ChromeMain+0x424cd18>
 4251fac: 721e791f     	tst	w8, #0xfffffffd
 4251fb0: 540001a1     	b.ne	0x4251fe4 <_ChromeMain+0x424cd48>
 4251fb4: 394203e8     	ldrb	w8, [sp, #0x80]
 4251fb8: 7103fd1f     	cmp	w8, #0xff
 4251fbc: 54fff400     	b.eq	0x4251e3c <_ChromeMain+0x424cba0>
 4251fc0: 721e791f     	tst	w8, #0xfffffffd
 4251fc4: 54fff3c0     	b.eq	0x4251e3c <_ChromeMain+0x424cba0>
 4251fc8: 7100111f     	cmp	w8, #0x4
 4251fcc: 54000280     	b.eq	0x425201c <_ChromeMain+0x424cd80>
 4251fd0: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251fd4: d101c3a0     	sub	x0, x29, #0x70
 4251fd8: 9101a3e1     	add	x1, sp, #0x68
 4251fdc: d63f0100     	blr	x8
 4251fe0: 17ffff97     	b	0x4251e3c <_ChromeMain+0x424cba0>
 4251fe4: 7100111f     	cmp	w8, #0x4
 4251fe8: 540000c0     	b.eq	0x4252000 <_ChromeMain+0x424cd64>
 4251fec: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251ff0: d101c3a0     	sub	x0, x29, #0x70
 4251ff4: 910123e1     	add	x1, sp, #0x48
 4251ff8: d63f0100     	blr	x8
 4251ffc: 17ffffee     	b	0x4251fb4 <_ChromeMain+0x424cd18>
 4252000: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4252004: 36fffd88     	tbz	w8, #0x1f, 0x4251fb4 <_ChromeMain+0x424cd18>
 4252008: f94027e0     	ldr	x0, [sp, #0x48]
 425200c: f9402fe8     	ldr	x8, [sp, #0x58]
 4252010: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252014: 96f6dba9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4252018: 17ffffe7     	b	0x4251fb4 <_ChromeMain+0x424cd18>
 425201c: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 4252020: 36fff0e8     	tbz	w8, #0x1f, 0x4251e3c <_ChromeMain+0x424cba0>
 4252024: f94037e0     	ldr	x0, [sp, #0x68]
 4252028: f9403fe8     	ldr	x8, [sp, #0x78]
 425202c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4252030: 17ffff82     	b	0x4251e38 <_ChromeMain+0x424cb9c>
 4252034: 94f6c8cb     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4252038: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 425203c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4252040: 910043fd     	add	x29, sp, #0x10
 4252044: b4000400     	cbz	x0, 0x42520c4 <_ChromeMain+0x424ce28>
 4252048: f9402013     	ldr	x19, [x0, #0x40]
 425204c: 97b0caff     	bl	0x2e84c48 <_ChromeMain+0x2e7f9ac>
 4252050: aa1303e1     	mov	x1, x19
 4252054: 52800022     	mov	w2, #0x1                ; =1
 4252058: 96f8034f     	bl	0x52d94 <_ChromeMain+0x4daf8>
 425205c: b4000340     	cbz	x0, 0x42520c4 <_ChromeMain+0x424ce28>
 4252060: aa0003f3     	mov	x19, x0
 4252064: f9401800     	ldr	x0, [x0, #0x30]
 4252068: b4000060     	cbz	x0, 0x4252074 <_ChromeMain+0x424cdd8>
 425206c: 39412008     	ldrb	w8, [x0, #0x48]
 4252070: 360000a8     	tbz	w8, #0x0, 0x4252084 <_ChromeMain+0x424cde8>
 4252074: aa1303e0     	mov	x0, x19
 4252078: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 425207c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4252080: 17fca91b     	b	0x417c4ec <_ChromeMain+0x4177250>
 4252084: f9400008     	ldr	x8, [x0]
 4252088: f940b508     	ldr	x8, [x8, #0x168]
 425208c: d63f0100     	blr	x8
 4252090: b4ffff20     	cbz	x0, 0x4252074 <_ChromeMain+0x424cdd8>
 4252094: aa0003f4     	mov	x20, x0
 4252098: 900464c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 425209c: 9114c421     	add	x1, x1, #0x531
 42520a0: 52800502     	mov	w2, #0x28               ; =40
 42520a4: 9709aaea     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 42520a8: b4fffe60     	cbz	x0, 0x4252074 <_ChromeMain+0x424cdd8>
 42520ac: 900464c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 42520b0: 9114c421     	add	x1, x1, #0x531
 42520b4: aa1403e0     	mov	x0, x20
 42520b8: 52800502     	mov	w2, #0x28               ; =40
 42520bc: 9702d111     	bl	0x306500 <_ChromeMain+0x301264>
 42520c0: 3607fda0     	tbz	w0, #0x0, 0x4252074 <_ChromeMain+0x424cdd8>
 42520c4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 42520c8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 42520cc: d65f03c0     	ret
 42520d0: f9401808     	ldr	x8, [x0, #0x30]
 42520d4: b4000068     	cbz	x8, 0x42520e0 <_ChromeMain+0x424ce44>
 42520d8: 19404108     	ldapurb	w8, [x8, #0x4]
 42520dc: 34000048     	cbz	w8, 0x42520e4 <_ChromeMain+0x424ce48>
 42520e0: d65f03c0     	ret
 42520e4: f9401c08     	ldr	x8, [x0, #0x38]
 42520e8: b4ffffc8     	cbz	x8, 0x42520e0 <_ChromeMain+0x424ce44>
 42520ec: f9401808     	ldr	x8, [x0, #0x30]
 42520f0: b40001c8     	cbz	x8, 0x4252128 <_ChromeMain+0x424ce8c>
 42520f4: a9422404     	ldp	x4, x9, [x0, #0x20]
 42520f8: 19404108     	ldapurb	w8, [x8, #0x4]
 42520fc: 35000168     	cbnz	w8, 0x4252128 <_ChromeMain+0x424ce8c>
 4252100: f9401c08     	ldr	x8, [x0, #0x38]
 4252104: 8b890508     	add	x8, x8, x9, asr #1
 4252108: 36000069     	tbz	w9, #0x0, 0x4252114 <_ChromeMain+0x424ce78>
 425210c: f9400109     	ldr	x9, [x8]
 4252110: f8644924     	ldr	x4, [x9, w4, uxtw]
 4252114: b9405002     	ldr	w2, [x0, #0x50]
 4252118: f9400023     	ldr	x3, [x1]
 425211c: 91010001     	add	x1, x0, #0x40
 4252120: aa0803e0     	mov	x0, x8
 4252124: d61f0080     	br	x4
 4252128: d4200000     	brk	#0
 425212c: d4400000     	hlt	#0
