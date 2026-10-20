
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462d99c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 462d9a0: a90167fa     	stp	x26, x25, [sp, #0x10]
 462d9a4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 462d9a8: a90357f6     	stp	x22, x21, [sp, #0x30]
 462d9ac: a9044ff4     	stp	x20, x19, [sp, #0x40]
 462d9b0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 462d9b4: 910143fd     	add	x29, sp, #0x50
 462d9b8: d10f43ff     	sub	sp, sp, #0x3d0
 462d9bc: 39405c28     	ldrb	w8, [x1, #0x17]
 462d9c0: f9400429     	ldr	x9, [x1, #0x8]
 462d9c4: 7219011f     	tst	w8, #0x80
 462d9c8: 9a881128     	csel	x8, x9, x8, ne
 462d9cc: b4000ac8     	cbz	x8, 0x462db24 <_ChromeMain+0x4628888>
 462d9d0: aa0003f3     	mov	x19, x0
 462d9d4: f9423408     	ldr	x8, [x0, #0x468]
 462d9d8: b4000a68     	cbz	x8, 0x462db24 <_ChromeMain+0x4628888>
 462d9dc: aa0103f5     	mov	x21, x1
 462d9e0: f9404908     	ldr	x8, [x8, #0x90]
 462d9e4: b4000b08     	cbz	x8, 0x462db44 <_ChromeMain+0x46288a8>
 462d9e8: b9401119     	ldr	w25, [x8, #0x10]
 462d9ec: 52800038     	mov	w24, #0x1               ; =1
 462d9f0: 910283f7     	add	x23, sp, #0xa0
 462d9f4: 91400676     	add	x22, x19, #0x1, lsl #12 ; =0x1000
 462d9f8: aa1303e0     	mov	x0, x19
 462d9fc: aa1503e1     	mov	x1, x21
 462da00: d2800002     	mov	x2, #0x0                ; =0
 462da04: 52800003     	mov	w3, #0x0                ; =0
 462da08: 94002af1     	bl	0x46385cc <_ChromeMain+0x4633330>
 462da0c: d360fc08     	lsr	x8, x0, #32
 462da10: b5000a88     	cbnz	x8, 0x462db60 <_ChromeMain+0x46288c4>
 462da14: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 462da18: f9004bff     	str	xzr, [sp, #0x90]
 462da1c: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 462da20: 37f80988     	tbnz	w8, #0x1f, 0x462db50 <_ChromeMain+0x46288b4>
 462da24: 3dc002a0     	ldr	q0, [x21]
 462da28: 3d8023e0     	str	q0, [sp, #0x80]
 462da2c: f9400aa8     	ldr	x8, [x21, #0x10]
 462da30: f9004be8     	str	x8, [sp, #0x90]
 462da34: 913f8260     	add	x0, x19, #0xfe0
 462da38: 910203e1     	add	x1, sp, #0x80
 462da3c: 9784bb59     	bl	0x275c7a0 <_ChromeMain+0x2757504>
 462da40: 910023fa     	add	x26, sp, #0x8
 462da44: 910023e8     	add	x8, sp, #0x8
 462da48: aa1303e0     	mov	x0, x19
 462da4c: aa1503e1     	mov	x1, x21
 462da50: 9400270d     	bl	0x4637684 <_ChromeMain+0x46323e8>
 462da54: f9422e68     	ldr	x8, [x19, #0x458]
 462da58: b40000a8     	cbz	x8, 0x462da6c <_ChromeMain+0x46287d0>
 462da5c: f9429d14     	ldr	x20, [x8, #0x538]
 462da60: b4000094     	cbz	x20, 0x462da70 <_ChromeMain+0x46287d4>
 462da64: 39624268     	ldrb	w8, [x19, #0x890]
 462da68: 35000b48     	cbnz	w8, 0x462dbd0 <_ChromeMain+0x4628934>
 462da6c: d2800014     	mov	x20, #0x0               ; =0
 462da70: 9101c340     	add	x0, x26, #0x70
 462da74: d2800001     	mov	x1, #0x0                ; =0
 462da78: 96e7e890     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462da7c: 91008340     	add	x0, x26, #0x20
 462da80: 96e7e87e     	bl	0x27c78 <_ChromeMain+0x229dc>
 462da84: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462da88: 36f800a8     	tbz	w8, #0x1f, 0x462da9c <_ChromeMain+0x4628800>
 462da8c: f94007e0     	ldr	x0, [sp, #0x8]
 462da90: f9400fe8     	ldr	x8, [sp, #0x18]
 462da94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462da98: 96e76d08     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462da9c: 397fe268     	ldrb	w8, [x19, #0xff8]
 462daa0: 34000108     	cbz	w8, 0x462dac0 <_ChromeMain+0x4628824>
 462daa4: 39ffde68     	ldrsb	w8, [x19, #0xff7]
 462daa8: 36f800a8     	tbz	w8, #0x1f, 0x462dabc <_ChromeMain+0x4628820>
 462daac: f947f260     	ldr	x0, [x19, #0xfe0]
 462dab0: f947fa68     	ldr	x8, [x19, #0xff0]
 462dab4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462dab8: 96e76d00     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462dabc: 393fe27f     	strb	wzr, [x19, #0xff8]
 462dac0: b4000274     	cbz	x20, 0x462db0c <_ChromeMain+0x4628870>
 462dac4: f9423660     	ldr	x0, [x19, #0x468]
 462dac8: b4000220     	cbz	x0, 0x462db0c <_ChromeMain+0x4628870>
 462dacc: aa1403e1     	mov	x1, x20
 462dad0: 96e7e78c     	bl	0x27900 <_ChromeMain+0x22664>
 462dad4: 3100041f     	cmn	w0, #0x1
 462dad8: 540001a0     	b.eq	0x462db0c <_ChromeMain+0x4628870>
 462dadc: f9423668     	ldr	x8, [x19, #0x468]
 462dae0: f9400108     	ldr	x8, [x8]
 462dae4: 93407c01     	sxtw	x1, w0
 462dae8: aa0803e0     	mov	x0, x8
 462daec: 9728c203     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462daf0: b40000e0     	cbz	x0, 0x462db0c <_ChromeMain+0x4628870>
 462daf4: 39418408     	ldrb	w8, [x0, #0x61]
 462daf8: 370000a8     	tbnz	w8, #0x0, 0x462db0c <_ChromeMain+0x4628870>
 462dafc: 3941e008     	ldrb	w8, [x0, #0x78]
 462db00: 37000068     	tbnz	w8, #0x0, 0x462db0c <_ChromeMain+0x4628870>
 462db04: 39624268     	ldrb	w8, [x19, #0x890]
 462db08: 35000b68     	cbnz	w8, 0x462dc74 <_ChromeMain+0x46289d8>
 462db0c: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 462db10: 36f800a8     	tbz	w8, #0x1f, 0x462db24 <_ChromeMain+0x4628888>
 462db14: f94043e0     	ldr	x0, [sp, #0x80]
 462db18: f9404be8     	ldr	x8, [sp, #0x90]
 462db1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462db20: 96e76ce6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462db24: 910f43ff     	add	sp, sp, #0x3d0
 462db28: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 462db2c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 462db30: a94357f6     	ldp	x22, x21, [sp, #0x30]
 462db34: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 462db38: a94167fa     	ldp	x26, x25, [sp, #0x10]
 462db3c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 462db40: d65f03c0     	ret
 462db44: 52800018     	mov	w24, #0x0               ; =0
 462db48: 52800019     	mov	w25, #0x0               ; =0
 462db4c: 17ffffa9     	b	0x462d9f0 <_ChromeMain+0x4628754>
 462db50: a9400aa1     	ldp	x1, x2, [x21]
 462db54: 910203e0     	add	x0, sp, #0x80
 462db58: 96e7a9b0     	bl	0x18218 <_ChromeMain+0x12f7c>
 462db5c: 17ffffb6     	b	0x462da34 <_ChromeMain+0x4628798>
 462db60: aa0003f4     	mov	x20, x0
 462db64: f9423668     	ldr	x8, [x19, #0x468]
 462db68: f9400100     	ldr	x0, [x8]
 462db6c: 93407e81     	sxtw	x1, w20
 462db70: 9728c1e2     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462db74: 90052c3a     	adrp	x26, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462db78: b40000e0     	cbz	x0, 0x462db94 <_ChromeMain+0x46288f8>
 462db7c: 39418408     	ldrb	w8, [x0, #0x61]
 462db80: 370000a8     	tbnz	w8, #0x0, 0x462db94 <_ChromeMain+0x46288f8>
 462db84: 3941e008     	ldrb	w8, [x0, #0x78]
 462db88: 37000068     	tbnz	w8, #0x0, 0x462db94 <_ChromeMain+0x46288f8>
 462db8c: 39624268     	ldrb	w8, [x19, #0x890]
 462db90: 35002a48     	cbnz	w8, 0x462e0d8 <_ChromeMain+0x4628e3c>
 462db94: f9423675     	ldr	x21, [x19, #0x468]
 462db98: f9468f48     	ldr	x8, [x26, #0xd18]
 462db9c: d63f0100     	blr	x8
 462dba0: aa0003e3     	mov	x3, x0
 462dba4: aa1503e0     	mov	x0, x21
 462dba8: aa1403e1     	mov	x1, x20
 462dbac: 528000c2     	mov	w2, #0x6                ; =6
 462dbb0: 94dc87ce     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 462dbb4: aa1303e0     	mov	x0, x19
 462dbb8: 97fff9c2     	bl	0x462c2c0 <_ChromeMain+0x4627024>
 462dbbc: aa1303e0     	mov	x0, x19
 462dbc0: 97fff972     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462dbc4: aa1303e0     	mov	x0, x19
 462dbc8: 94002b62     	bl	0x4638950 <_ChromeMain+0x46336b4>
 462dbcc: 17ffffd6     	b	0x462db24 <_ChromeMain+0x4628888>
 462dbd0: 910283f5     	add	x21, sp, #0xa0
 462dbd4: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 462dbd8: b80172ff     	stur	wzr, [x23, #0x17]
 462dbdc: f9005bff     	str	xzr, [sp, #0xb0]
 462dbe0: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 462dbe4: ad0102e0     	stp	q0, q0, [x23, #0x20]
 462dbe8: ad0202e0     	stp	q0, q0, [x23, #0x40]
 462dbec: 790203ff     	strh	wzr, [sp, #0x100]
 462dbf0: a910ffff     	stp	xzr, xzr, [sp, #0x108]
 462dbf4: 52800028     	mov	w8, #0x1                ; =1
 462dbf8: b9011be8     	str	w8, [sp, #0x118]
 462dbfc: 910483e0     	add	x0, sp, #0x120
 462dc00: 910023e1     	add	x1, sp, #0x8
 462dc04: 910283e2     	add	x2, sp, #0xa0
 462dc08: 52800063     	mov	w3, #0x3                ; =3
 462dc0c: 52800004     	mov	w4, #0x0                ; =0
 462dc10: 52800005     	mov	w5, #0x0                ; =0
 462dc14: 944e2129     	bl	0x59b60b8 <_ChromeMain+0x59b0e1c>
 462dc18: 9100a280     	add	x0, x20, #0x28
 462dc1c: 97cf73e5     	bl	0x3a0abb0 <_ChromeMain+0x3a05914>
 462dc20: 910483e2     	add	x2, sp, #0x120
 462dc24: d2800001     	mov	x1, #0x0                ; =0
 462dc28: d2800003     	mov	x3, #0x0                ; =0
 462dc2c: 97ecdd5f     	bl	0x41651a8 <_ChromeMain+0x415ff0c>
 462dc30: aa0003f4     	mov	x20, x0
 462dc34: 910483e0     	add	x0, sp, #0x120
 462dc38: 97778a1d     	bl	0x24104ac <_ChromeMain+0x240b210>
 462dc3c: 9101c2a0     	add	x0, x21, #0x70
 462dc40: d2800001     	mov	x1, #0x0                ; =0
 462dc44: 96e7e81d     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 462dc48: 910082a0     	add	x0, x21, #0x20
 462dc4c: 96e7e80b     	bl	0x27c78 <_ChromeMain+0x229dc>
 462dc50: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 462dc54: 36fff0e8     	tbz	w8, #0x1f, 0x462da70 <_ChromeMain+0x46287d4>
 462dc58: f94053e0     	ldr	x0, [sp, #0xa0]
 462dc5c: f9405be8     	ldr	x8, [sp, #0xb0]
 462dc60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462dc64: 96e76c95     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462dc68: 17ffff82     	b	0x462da70 <_ChromeMain+0x46287d4>
 462dc6c: aa0803ea     	mov	x10, x8
 462dc70: 14000011     	b	0x462dcb4 <_ChromeMain+0x4628a18>
 462dc74: b9401014     	ldr	w20, [x0, #0x10]
 462dc78: f9486e68     	ldr	x8, [x19, #0x10d8]
 462dc7c: f9487269     	ldr	x9, [x19, #0x10e0]
 462dc80: d37ef52a     	lsl	x10, x9, #2
 462dc84: b4ffff4a     	cbz	x10, 0x462dc6c <_ChromeMain+0x46289d0>
 462dc88: 9342fd4b     	asr	x11, x10, #2
 462dc8c: aa0803ea     	mov	x10, x8
 462dc90: d341fd6c     	lsr	x12, x11, #1
 462dc94: 8b0c094d     	add	x13, x10, x12, lsl #2
 462dc98: b84045ae     	ldr	w14, [x13], #0x4
 462dc9c: aa6b07ef     	mvn	x15, x11, lsr #1
 462dca0: 8b0f016b     	add	x11, x11, x15
 462dca4: 6b1401df     	cmp	w14, w20
 462dca8: 9a8cb16b     	csel	x11, x11, x12, lt
 462dcac: 9a8ab1aa     	csel	x10, x13, x10, lt
 462dcb0: b5ffff0b     	cbnz	x11, 0x462dc90 <_ChromeMain+0x46289f4>
 462dcb4: 8b090908     	add	x8, x8, x9, lsl #2
 462dcb8: eb08015f     	cmp	x10, x8
 462dcbc: 54000080     	b.eq	0x462dccc <_ChromeMain+0x4628a30>
 462dcc0: b9400148     	ldr	w8, [x10]
 462dcc4: 6b08029f     	cmp	w20, w8
 462dcc8: 54fff22a     	b.ge	0x462db0c <_ChromeMain+0x4628870>
 462dccc: f9484a68     	ldr	x8, [x19, #0x1090]
 462dcd0: f9484e69     	ldr	x9, [x19, #0x1098]
 462dcd4: d37ef52a     	lsl	x10, x9, #2
 462dcd8: b400026a     	cbz	x10, 0x462dd24 <_ChromeMain+0x4628a88>
 462dcdc: 9342fd4b     	asr	x11, x10, #2
 462dce0: aa0803ea     	mov	x10, x8
 462dce4: d341fd6c     	lsr	x12, x11, #1
 462dce8: 8b0c094d     	add	x13, x10, x12, lsl #2
 462dcec: b84045ae     	ldr	w14, [x13], #0x4
 462dcf0: aa6b07ef     	mvn	x15, x11, lsr #1
 462dcf4: 8b0f016b     	add	x11, x11, x15
 462dcf8: 6b1401df     	cmp	w14, w20
 462dcfc: 9a8cb16b     	csel	x11, x11, x12, lt
 462dd00: 9a8ab1aa     	csel	x10, x13, x10, lt
 462dd04: b5ffff0b     	cbnz	x11, 0x462dce4 <_ChromeMain+0x4628a48>
 462dd08: 8b090908     	add	x8, x8, x9, lsl #2
 462dd0c: eb08015f     	cmp	x10, x8
 462dd10: 540000e0     	b.eq	0x462dd2c <_ChromeMain+0x4628a90>
 462dd14: b9400148     	ldr	w8, [x10]
 462dd18: 6b08029f     	cmp	w20, w8
 462dd1c: 5400008b     	b.lt	0x462dd2c <_ChromeMain+0x4628a90>
 462dd20: 17ffff7b     	b	0x462db0c <_ChromeMain+0x4628870>
 462dd24: aa0803ea     	mov	x10, x8
 462dd28: 17fffff8     	b	0x462dd08 <_ChromeMain+0x4628a6c>
 462dd2c: b900a3f4     	str	w20, [sp, #0xa0]
 462dd30: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 462dd34: 37f800c8     	tbnz	w8, #0x1f, 0x462dd4c <_ChromeMain+0x4628ab0>
 462dd38: 3dc023e0     	ldr	q0, [sp, #0x80]
 462dd3c: 3d8022e0     	str	q0, [x23, #0x80]
 462dd40: f9404be8     	ldr	x8, [sp, #0x90]
 462dd44: f9009be8     	str	x8, [sp, #0x130]
 462dd48: 14000004     	b	0x462dd58 <_ChromeMain+0x4628abc>
 462dd4c: a9480be1     	ldp	x1, x2, [sp, #0x80]
 462dd50: 910483e0     	add	x0, sp, #0x120
 462dd54: 96e7a931     	bl	0x18218 <_ChromeMain+0x12f7c>
 462dd58: 910483f5     	add	x21, sp, #0x120
 462dd5c: b9013bf9     	str	w25, [sp, #0x138]
 462dd60: 3904f3f8     	strb	w24, [sp, #0x13c]
 462dd64: b90143f4     	str	w20, [sp, #0x140]
 462dd68: 52800028     	mov	w8, #0x1                ; =1
 462dd6c: 390513e8     	strb	w8, [sp, #0x144]
 462dd70: 52827a08     	mov	w8, #0x13d0             ; =5072
 462dd74: 8b080278     	add	x24, x19, x8
 462dd78: 394fe2c8     	ldrb	w8, [x22, #0x3f8]
 462dd7c: 34003328     	cbz	w8, 0x462e3e0 <_ChromeMain+0x4629144>
 462dd80: 39cf9ec8     	ldrsb	w8, [x22, #0x3e7]
 462dd84: 37f835e8     	tbnz	w8, #0x1f, 0x462e440 <_ChromeMain+0x46291a4>
 462dd88: 52800028     	mov	w8, #0x1                ; =1
 462dd8c: aa1403e9     	mov	x9, x20
 462dd90: 3dc022e0     	ldr	q0, [x23, #0x80]
 462dd94: 3d800300     	str	q0, [x24]
 462dd98: f9409bea     	ldr	x10, [sp, #0x130]
 462dd9c: f9000b0a     	str	x10, [x24, #0x10]
 462dda0: 3904dfff     	strb	wzr, [sp, #0x137]
 462dda4: 390483ff     	strb	wzr, [sp, #0x120]
 462dda8: 52827d0a     	mov	w10, #0x13e8            ; =5096
 462ddac: 8b0a026a     	add	x10, x19, x10
 462ddb0: b84182ab     	ldur	w11, [x21, #0x18]
 462ddb4: b913ea6b     	str	w11, [x19, #0x13e8]
 462ddb8: 3841c2ab     	ldurb	w11, [x21, #0x1c]
 462ddbc: 3900114b     	strb	w11, [x10, #0x4]
 462ddc0: b913f269     	str	w9, [x19, #0x13f0]
 462ddc4: 390fd2c8     	strb	w8, [x22, #0x3f4]
 462ddc8: 52821208     	mov	w8, #0x1090             ; =4240
 462ddcc: f9484a69     	ldr	x9, [x19, #0x1090]
 462ddd0: f9484e6a     	ldr	x10, [x19, #0x1098]
 462ddd4: d37ef54b     	lsl	x11, x10, #2
 462ddd8: b40001ab     	cbz	x11, 0x462de0c <_ChromeMain+0x4628b70>
 462dddc: 9342fd6b     	asr	x11, x11, #2
 462dde0: aa0903e1     	mov	x1, x9
 462dde4: d341fd6c     	lsr	x12, x11, #1
 462dde8: 8b0c082d     	add	x13, x1, x12, lsl #2
 462ddec: b84045ae     	ldr	w14, [x13], #0x4
 462ddf0: aa6b07ef     	mvn	x15, x11, lsr #1
 462ddf4: 8b0f016b     	add	x11, x11, x15
 462ddf8: 6b1401df     	cmp	w14, w20
 462ddfc: 9a8cb16b     	csel	x11, x11, x12, lt
 462de00: 9a81b1a1     	csel	x1, x13, x1, lt
 462de04: b5ffff0b     	cbnz	x11, 0x462dde4 <_ChromeMain+0x4628b48>
 462de08: 14000002     	b	0x462de10 <_ChromeMain+0x4628b74>
 462de0c: aa0903e1     	mov	x1, x9
 462de10: 8b0a0929     	add	x9, x9, x10, lsl #2
 462de14: aa0103e2     	mov	x2, x1
 462de18: eb09003f     	cmp	x1, x9
 462de1c: 540000c0     	b.eq	0x462de34 <_ChromeMain+0x4628b98>
 462de20: b9400029     	ldr	w9, [x1]
 462de24: 6b09029f     	cmp	w20, w9
 462de28: 52800089     	mov	w9, #0x4                ; =4
 462de2c: 9a89b3e9     	csel	x9, xzr, x9, lt
 462de30: 8b090022     	add	x2, x1, x9
 462de34: 8b080260     	add	x0, x19, x8
 462de38: 9419aebe     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 462de3c: f9480268     	ldr	x8, [x19, #0x1000]
 462de40: f9480669     	ldr	x9, [x19, #0x1008]
 462de44: d37be92a     	lsl	x10, x9, #5
 462de48: b400138a     	cbz	x10, 0x462e0b8 <_ChromeMain+0x4628e1c>
 462de4c: 9345fd4a     	asr	x10, x10, #5
 462de50: aa0803e1     	mov	x1, x8
 462de54: d341fd4b     	lsr	x11, x10, #1
 462de58: 8b0b142c     	add	x12, x1, x11, lsl #5
 462de5c: b842058d     	ldr	w13, [x12], #0x20
 462de60: aa6a07ee     	mvn	x14, x10, lsr #1
 462de64: 8b0e014a     	add	x10, x10, x14
 462de68: 6b1401bf     	cmp	w13, w20
 462de6c: 9a8bb14a     	csel	x10, x10, x11, lt
 462de70: 9a81b181     	csel	x1, x12, x1, lt
 462de74: b5ffff0a     	cbnz	x10, 0x462de54 <_ChromeMain+0x4628bb8>
 462de78: 8b091508     	add	x8, x8, x9, lsl #5
 462de7c: eb08003f     	cmp	x1, x8
 462de80: 54000080     	b.eq	0x462de90 <_ChromeMain+0x4628bf4>
 462de84: b9400028     	ldr	w8, [x1]
 462de88: 6b08029f     	cmp	w20, w8
 462de8c: 540026aa     	b.ge	0x462e360 <_ChromeMain+0x46290c4>
 462de90: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 462de94: 910283e2     	add	x2, sp, #0xa0
 462de98: 910203e3     	add	x3, sp, #0x80
 462de9c: 940150b7     	bl	0x4682178 <_ChromeMain+0x467cedc>
 462dea0: f947e668     	ldr	x8, [x19, #0xfc8]
 462dea4: f947ea69     	ldr	x9, [x19, #0xfd0]
 462dea8: d37be92a     	lsl	x10, x9, #5
 462deac: b40010aa     	cbz	x10, 0x462e0c0 <_ChromeMain+0x4628e24>
 462deb0: 9345fd4a     	asr	x10, x10, #5
 462deb4: aa0803e1     	mov	x1, x8
 462deb8: d341fd4b     	lsr	x11, x10, #1
 462debc: 8b0b142c     	add	x12, x1, x11, lsl #5
 462dec0: b842058d     	ldr	w13, [x12], #0x20
 462dec4: aa6a07ee     	mvn	x14, x10, lsr #1
 462dec8: 8b0e014a     	add	x10, x10, x14
 462decc: 6b1401bf     	cmp	w13, w20
 462ded0: 9a8bb14a     	csel	x10, x10, x11, lt
 462ded4: 9a81b181     	csel	x1, x12, x1, lt
 462ded8: b5ffff0a     	cbnz	x10, 0x462deb8 <_ChromeMain+0x4628c1c>
 462dedc: 8b091508     	add	x8, x8, x9, lsl #5
 462dee0: eb08003f     	cmp	x1, x8
 462dee4: 54000080     	b.eq	0x462def4 <_ChromeMain+0x4628c58>
 462dee8: b9400028     	ldr	w8, [x1]
 462deec: 6b08029f     	cmp	w20, w8
 462def0: 5400258a     	b.ge	0x462e3a0 <_ChromeMain+0x4629104>
 462def4: 913f2260     	add	x0, x19, #0xfc8
 462def8: 910283e2     	add	x2, sp, #0xa0
 462defc: 910203e3     	add	x3, sp, #0x80
 462df00: 9401509e     	bl	0x4682178 <_ChromeMain+0x467cedc>
 462df04: 90052c28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462df08: f9468d08     	ldr	x8, [x8, #0xd18]
 462df0c: d63f0100     	blr	x8
 462df10: f90093e0     	str	x0, [sp, #0x120]
 462df14: f9485668     	ldr	x8, [x19, #0x10a8]
 462df18: f9485a69     	ldr	x9, [x19, #0x10b0]
 462df1c: d37ced2a     	lsl	x10, x9, #4
 462df20: b4000d4a     	cbz	x10, 0x462e0c8 <_ChromeMain+0x4628e2c>
 462df24: 9344fd4a     	asr	x10, x10, #4
 462df28: aa0803e1     	mov	x1, x8
 462df2c: d341fd4b     	lsr	x11, x10, #1
 462df30: 8b0b102c     	add	x12, x1, x11, lsl #4
 462df34: b841058d     	ldr	w13, [x12], #0x10
 462df38: aa6a07ee     	mvn	x14, x10, lsr #1
 462df3c: 8b0e014a     	add	x10, x10, x14
 462df40: 6b1401bf     	cmp	w13, w20
 462df44: 9a8bb14a     	csel	x10, x10, x11, lt
 462df48: 9a81b181     	csel	x1, x12, x1, lt
 462df4c: b5ffff0a     	cbnz	x10, 0x462df2c <_ChromeMain+0x4628c90>
 462df50: 8b091108     	add	x8, x8, x9, lsl #4
 462df54: eb08003f     	cmp	x1, x8
 462df58: 54000080     	b.eq	0x462df68 <_ChromeMain+0x4628ccc>
 462df5c: b9400028     	ldr	w8, [x1]
 462df60: 6b08029f     	cmp	w20, w8
 462df64: 54000b6a     	b.ge	0x462e0d0 <_ChromeMain+0x4628e34>
 462df68: 52821508     	mov	w8, #0x10a8             ; =4264
 462df6c: 8b080260     	add	x0, x19, x8
 462df70: 910283e2     	add	x2, sp, #0xa0
 462df74: 910483e3     	add	x3, sp, #0x120
 462df78: 94015164     	bl	0x4682508 <_ChromeMain+0x467d26c>
 462df7c: aa1303e0     	mov	x0, x19
 462df80: 97fff8d0     	bl	0x462c2c0 <_ChromeMain+0x4627024>
 462df84: aa1303e0     	mov	x0, x19
 462df88: 97fff880     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462df8c: aa1303e0     	mov	x0, x19
 462df90: 94002a70     	bl	0x4638950 <_ChromeMain+0x46336b4>
 462df94: 17fffede     	b	0x462db0c <_ChromeMain+0x4628870>
 462df98: 9342fd4b     	asr	x11, x10, #2
 462df9c: aa0803ea     	mov	x10, x8
 462dfa0: d341fd6c     	lsr	x12, x11, #1
 462dfa4: 8b0c094d     	add	x13, x10, x12, lsl #2
 462dfa8: b84045ae     	ldr	w14, [x13], #0x4
 462dfac: aa6b07ef     	mvn	x15, x11, lsr #1
 462dfb0: 8b0f016b     	add	x11, x11, x15
 462dfb4: 6b1b01df     	cmp	w14, w27
 462dfb8: 9a8cb16b     	csel	x11, x11, x12, lt
 462dfbc: 9a8ab1aa     	csel	x10, x13, x10, lt
 462dfc0: b5ffff0b     	cbnz	x11, 0x462dfa0 <_ChromeMain+0x4628d04>
 462dfc4: 1400004b     	b	0x462e0f0 <_ChromeMain+0x4628e54>
 462dfc8: 9342fd4b     	asr	x11, x10, #2
 462dfcc: aa0803ea     	mov	x10, x8
 462dfd0: d341fd6c     	lsr	x12, x11, #1
 462dfd4: 8b0c094d     	add	x13, x10, x12, lsl #2
 462dfd8: b84045ae     	ldr	w14, [x13], #0x4
 462dfdc: aa6b07ef     	mvn	x15, x11, lsr #1
 462dfe0: 8b0f016b     	add	x11, x11, x15
 462dfe4: 6b1b01df     	cmp	w14, w27
 462dfe8: 9a8cb16b     	csel	x11, x11, x12, lt
 462dfec: 9a8ab1aa     	csel	x10, x13, x10, lt
 462dff0: b5ffff0b     	cbnz	x11, 0x462dfd0 <_ChromeMain+0x4628d34>
 462dff4: 1400004a     	b	0x462e11c <_ChromeMain+0x4628e80>
 462dff8: 9342fd6b     	asr	x11, x11, #2
 462dffc: aa0903e1     	mov	x1, x9
 462e000: d341fd6c     	lsr	x12, x11, #1
 462e004: 8b0c082d     	add	x13, x1, x12, lsl #2
 462e008: b84045ae     	ldr	w14, [x13], #0x4
 462e00c: aa6b07ef     	mvn	x15, x11, lsr #1
 462e010: 8b0f016b     	add	x11, x11, x15
 462e014: 6b1b01df     	cmp	w14, w27
 462e018: 9a8cb16b     	csel	x11, x11, x12, lt
 462e01c: 9a81b1a1     	csel	x1, x13, x1, lt
 462e020: b5ffff0b     	cbnz	x11, 0x462e000 <_ChromeMain+0x4628d64>
 462e024: 14000080     	b	0x462e224 <_ChromeMain+0x4628f88>
 462e028: 9345fd4a     	asr	x10, x10, #5
 462e02c: aa0803e1     	mov	x1, x8
 462e030: d341fd4b     	lsr	x11, x10, #1
 462e034: 8b0b142c     	add	x12, x1, x11, lsl #5
 462e038: b842058d     	ldr	w13, [x12], #0x20
 462e03c: aa6a07ee     	mvn	x14, x10, lsr #1
 462e040: 8b0e014a     	add	x10, x10, x14
 462e044: 6b1b01bf     	cmp	w13, w27
 462e048: 9a8bb14a     	csel	x10, x10, x11, lt
 462e04c: 9a81b181     	csel	x1, x12, x1, lt
 462e050: b5ffff0a     	cbnz	x10, 0x462e030 <_ChromeMain+0x4628d94>
 462e054: 14000084     	b	0x462e264 <_ChromeMain+0x4628fc8>
 462e058: 9345fd4a     	asr	x10, x10, #5
 462e05c: aa0803e1     	mov	x1, x8
 462e060: d341fd4b     	lsr	x11, x10, #1
 462e064: 8b0b142c     	add	x12, x1, x11, lsl #5
 462e068: b842058d     	ldr	w13, [x12], #0x20
 462e06c: aa6a07ee     	mvn	x14, x10, lsr #1
 462e070: 8b0e014a     	add	x10, x10, x14
 462e074: 6b1b01bf     	cmp	w13, w27
 462e078: 9a8bb14a     	csel	x10, x10, x11, lt
 462e07c: 9a81b181     	csel	x1, x12, x1, lt
 462e080: b5ffff0a     	cbnz	x10, 0x462e060 <_ChromeMain+0x4628dc4>
 462e084: 14000088     	b	0x462e2a4 <_ChromeMain+0x4629008>
 462e088: 9344fd4a     	asr	x10, x10, #4
 462e08c: aa0803e1     	mov	x1, x8
 462e090: d341fd4b     	lsr	x11, x10, #1
 462e094: 8b0b102c     	add	x12, x1, x11, lsl #4
 462e098: b841058d     	ldr	w13, [x12], #0x10
 462e09c: aa6a07ee     	mvn	x14, x10, lsr #1
 462e0a0: 8b0e014a     	add	x10, x10, x14
 462e0a4: 6b1b01bf     	cmp	w13, w27
 462e0a8: 9a8bb14a     	csel	x10, x10, x11, lt
 462e0ac: 9a81b181     	csel	x1, x12, x1, lt
 462e0b0: b5ffff0a     	cbnz	x10, 0x462e090 <_ChromeMain+0x4628df4>
 462e0b4: 1400009d     	b	0x462e328 <_ChromeMain+0x462908c>
 462e0b8: aa0803e1     	mov	x1, x8
 462e0bc: 17ffff6f     	b	0x462de78 <_ChromeMain+0x4628bdc>
 462e0c0: aa0803e1     	mov	x1, x8
 462e0c4: 17ffff86     	b	0x462dedc <_ChromeMain+0x4628c40>
 462e0c8: aa0803e1     	mov	x1, x8
 462e0cc: 17ffffa1     	b	0x462df50 <_ChromeMain+0x4628cb4>
 462e0d0: f9000420     	str	x0, [x1, #0x8]
 462e0d4: 17ffffaa     	b	0x462df7c <_ChromeMain+0x4628ce0>
 462e0d8: b940101b     	ldr	w27, [x0, #0x10]
 462e0dc: f9486e68     	ldr	x8, [x19, #0x10d8]
 462e0e0: f9487269     	ldr	x9, [x19, #0x10e0]
 462e0e4: d37ef52a     	lsl	x10, x9, #2
 462e0e8: b5fff58a     	cbnz	x10, 0x462df98 <_ChromeMain+0x4628cfc>
 462e0ec: aa0803ea     	mov	x10, x8
 462e0f0: 8b090908     	add	x8, x8, x9, lsl #2
 462e0f4: eb08015f     	cmp	x10, x8
 462e0f8: 54000080     	b.eq	0x462e108 <_ChromeMain+0x4628e6c>
 462e0fc: b9400148     	ldr	w8, [x10]
 462e100: 6b08037f     	cmp	w27, w8
 462e104: 54ffd48a     	b.ge	0x462db94 <_ChromeMain+0x46288f8>
 462e108: f9484a68     	ldr	x8, [x19, #0x1090]
 462e10c: f9484e69     	ldr	x9, [x19, #0x1098]
 462e110: d37ef52a     	lsl	x10, x9, #2
 462e114: b5fff5aa     	cbnz	x10, 0x462dfc8 <_ChromeMain+0x4628d2c>
 462e118: aa0803ea     	mov	x10, x8
 462e11c: 8b090908     	add	x8, x8, x9, lsl #2
 462e120: eb08015f     	cmp	x10, x8
 462e124: 54000080     	b.eq	0x462e134 <_ChromeMain+0x4628e98>
 462e128: b9400148     	ldr	w8, [x10]
 462e12c: 6b08037f     	cmp	w27, w8
 462e130: 54ffd32a     	b.ge	0x462db94 <_ChromeMain+0x46288f8>
 462e134: b900a3fb     	str	w27, [sp, #0xa0]
 462e138: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 462e13c: 37f800c8     	tbnz	w8, #0x1f, 0x462e154 <_ChromeMain+0x4628eb8>
 462e140: 3dc002a0     	ldr	q0, [x21]
 462e144: 3d8022e0     	str	q0, [x23, #0x80]
 462e148: f9400aa8     	ldr	x8, [x21, #0x10]
 462e14c: f9009be8     	str	x8, [sp, #0x130]
 462e150: 14000004     	b	0x462e160 <_ChromeMain+0x4628ec4>
 462e154: a9400aa1     	ldp	x1, x2, [x21]
 462e158: 910483e0     	add	x0, sp, #0x120
 462e15c: 96e7a82f     	bl	0x18218 <_ChromeMain+0x12f7c>
 462e160: 910483e8     	add	x8, sp, #0x120
 462e164: b9013bf9     	str	w25, [sp, #0x138]
 462e168: 3904f3f8     	strb	w24, [sp, #0x13c]
 462e16c: b90143fb     	str	w27, [sp, #0x140]
 462e170: 390513ff     	strb	wzr, [sp, #0x144]
 462e174: 52827a09     	mov	w9, #0x13d0             ; =5072
 462e178: 8b090278     	add	x24, x19, x9
 462e17c: 394fe2c9     	ldrb	w9, [x22, #0x3f8]
 462e180: 35000229     	cbnz	w9, 0x462e1c4 <_ChromeMain+0x4628f28>
 462e184: b40016d8     	cbz	x24, 0x462e45c <_ChromeMain+0x46291c0>
 462e188: 3dc022e0     	ldr	q0, [x23, #0x80]
 462e18c: 3d800300     	str	q0, [x24]
 462e190: f9409be9     	ldr	x9, [sp, #0x130]
 462e194: f9000b09     	str	x9, [x24, #0x10]
 462e198: a912ffff     	stp	xzr, xzr, [sp, #0x128]
 462e19c: f90093ff     	str	xzr, [sp, #0x120]
 462e1a0: 52827d09     	mov	w9, #0x13e8             ; =5096
 462e1a4: 8b090269     	add	x9, x19, x9
 462e1a8: f841810a     	ldur	x10, [x8, #0x18]
 462e1ac: f909f66a     	str	x10, [x19, #0x13e8]
 462e1b0: f841d108     	ldur	x8, [x8, #0x1d]
 462e1b4: f8005128     	stur	x8, [x9, #0x5]
 462e1b8: 52800028     	mov	w8, #0x1                ; =1
 462e1bc: 390fe2c8     	strb	w8, [x22, #0x3f8]
 462e1c0: 14000013     	b	0x462e20c <_ChromeMain+0x4628f70>
 462e1c4: 39cf9ec9     	ldrsb	w9, [x22, #0x3e7]
 462e1c8: 37f812c9     	tbnz	w9, #0x1f, 0x462e420 <_ChromeMain+0x4629184>
 462e1cc: 52800009     	mov	w9, #0x0                ; =0
 462e1d0: aa1b03ea     	mov	x10, x27
 462e1d4: 3dc022e0     	ldr	q0, [x23, #0x80]
 462e1d8: 3d800300     	str	q0, [x24]
 462e1dc: f9409beb     	ldr	x11, [sp, #0x130]
 462e1e0: f9000b0b     	str	x11, [x24, #0x10]
 462e1e4: 3904dfff     	strb	wzr, [sp, #0x137]
 462e1e8: 390483ff     	strb	wzr, [sp, #0x120]
 462e1ec: 52827d0b     	mov	w11, #0x13e8            ; =5096
 462e1f0: 8b0b026b     	add	x11, x19, x11
 462e1f4: b841810c     	ldur	w12, [x8, #0x18]
 462e1f8: b913ea6c     	str	w12, [x19, #0x13e8]
 462e1fc: 3841c108     	ldurb	w8, [x8, #0x1c]
 462e200: 39001168     	strb	w8, [x11, #0x4]
 462e204: b913f26a     	str	w10, [x19, #0x13f0]
 462e208: 390fd2c9     	strb	w9, [x22, #0x3f4]
 462e20c: 52821208     	mov	w8, #0x1090             ; =4240
 462e210: f9484a69     	ldr	x9, [x19, #0x1090]
 462e214: f9484e6a     	ldr	x10, [x19, #0x1098]
 462e218: d37ef54b     	lsl	x11, x10, #2
 462e21c: b5ffeeeb     	cbnz	x11, 0x462dff8 <_ChromeMain+0x4628d5c>
 462e220: aa0903e1     	mov	x1, x9
 462e224: 8b0a0929     	add	x9, x9, x10, lsl #2
 462e228: aa0103e2     	mov	x2, x1
 462e22c: eb09003f     	cmp	x1, x9
 462e230: 540000c0     	b.eq	0x462e248 <_ChromeMain+0x4628fac>
 462e234: b9400029     	ldr	w9, [x1]
 462e238: 6b09037f     	cmp	w27, w9
 462e23c: 52800089     	mov	w9, #0x4                ; =4
 462e240: 9a89b3e9     	csel	x9, xzr, x9, lt
 462e244: 8b090022     	add	x2, x1, x9
 462e248: 8b080260     	add	x0, x19, x8
 462e24c: 9419adb9     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 462e250: f9480268     	ldr	x8, [x19, #0x1000]
 462e254: f9480669     	ldr	x9, [x19, #0x1008]
 462e258: d37be92a     	lsl	x10, x9, #5
 462e25c: b5ffee6a     	cbnz	x10, 0x462e028 <_ChromeMain+0x4628d8c>
 462e260: aa0803e1     	mov	x1, x8
 462e264: 8b091508     	add	x8, x8, x9, lsl #5
 462e268: aa0103e2     	mov	x2, x1
 462e26c: eb08003f     	cmp	x1, x8
 462e270: 540000c0     	b.eq	0x462e288 <_ChromeMain+0x4628fec>
 462e274: b9400028     	ldr	w8, [x1]
 462e278: 6b08037f     	cmp	w27, w8
 462e27c: 52800408     	mov	w8, #0x20               ; =32
 462e280: 9a88b3e8     	csel	x8, xzr, x8, lt
 462e284: 8b080022     	add	x2, x1, x8
 462e288: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 462e28c: 94014f72     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 462e290: f947e668     	ldr	x8, [x19, #0xfc8]
 462e294: f947ea69     	ldr	x9, [x19, #0xfd0]
 462e298: d37be92a     	lsl	x10, x9, #5
 462e29c: b5ffedea     	cbnz	x10, 0x462e058 <_ChromeMain+0x4628dbc>
 462e2a0: aa0803e1     	mov	x1, x8
 462e2a4: 8b091508     	add	x8, x8, x9, lsl #5
 462e2a8: eb08003f     	cmp	x1, x8
 462e2ac: 54000260     	b.eq	0x462e2f8 <_ChromeMain+0x462905c>
 462e2b0: b9400028     	ldr	w8, [x1]
 462e2b4: 6b08037f     	cmp	w27, w8
 462e2b8: 5400020b     	b.lt	0x462e2f8 <_ChromeMain+0x462905c>
 462e2bc: 91002020     	add	x0, x1, #0x8
 462e2c0: eb15001f     	cmp	x0, x21
 462e2c4: 54000220     	b.eq	0x462e308 <_ChromeMain+0x462906c>
 462e2c8: 39c07c29     	ldrsb	w9, [x1, #0x1f]
 462e2cc: 39405ea8     	ldrb	w8, [x21, #0x17]
 462e2d0: 37f80c89     	tbnz	w9, #0x1f, 0x462e460 <_ChromeMain+0x46291c4>
 462e2d4: 373800c8     	tbnz	w8, #0x7, 0x462e2ec <_ChromeMain+0x4629050>
 462e2d8: 3dc002a0     	ldr	q0, [x21]
 462e2dc: f9400aa8     	ldr	x8, [x21, #0x10]
 462e2e0: f9000808     	str	x8, [x0, #0x10]
 462e2e4: 3d800000     	str	q0, [x0]
 462e2e8: 14000008     	b	0x462e308 <_ChromeMain+0x462906c>
 462e2ec: a9400aa1     	ldp	x1, x2, [x21]
 462e2f0: 96f9e9f1     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 462e2f4: 14000005     	b	0x462e308 <_ChromeMain+0x462906c>
 462e2f8: 913f2260     	add	x0, x19, #0xfc8
 462e2fc: 910283e2     	add	x2, sp, #0xa0
 462e300: aa1503e3     	mov	x3, x21
 462e304: 94014f9d     	bl	0x4682178 <_ChromeMain+0x467cedc>
 462e308: f9468f48     	ldr	x8, [x26, #0xd18]
 462e30c: d63f0100     	blr	x8
 462e310: f90093e0     	str	x0, [sp, #0x120]
 462e314: f9485668     	ldr	x8, [x19, #0x10a8]
 462e318: f9485a69     	ldr	x9, [x19, #0x10b0]
 462e31c: d37ced2a     	lsl	x10, x9, #4
 462e320: b5ffeb4a     	cbnz	x10, 0x462e088 <_ChromeMain+0x4628dec>
 462e324: aa0803e1     	mov	x1, x8
 462e328: 8b091108     	add	x8, x8, x9, lsl #4
 462e32c: eb08003f     	cmp	x1, x8
 462e330: 540000c0     	b.eq	0x462e348 <_ChromeMain+0x46290ac>
 462e334: b9400028     	ldr	w8, [x1]
 462e338: 6b08037f     	cmp	w27, w8
 462e33c: 5400006b     	b.lt	0x462e348 <_ChromeMain+0x46290ac>
 462e340: f9000420     	str	x0, [x1, #0x8]
 462e344: 17fffe14     	b	0x462db94 <_ChromeMain+0x46288f8>
 462e348: 52821508     	mov	w8, #0x10a8             ; =4264
 462e34c: 8b080260     	add	x0, x19, x8
 462e350: 910283e2     	add	x2, sp, #0xa0
 462e354: 910483e3     	add	x3, sp, #0x120
 462e358: 9401506c     	bl	0x4682508 <_ChromeMain+0x467d26c>
 462e35c: 17fffe0e     	b	0x462db94 <_ChromeMain+0x46288f8>
 462e360: 91002020     	add	x0, x1, #0x8
 462e364: 910203e8     	add	x8, sp, #0x80
 462e368: eb08001f     	cmp	x0, x8
 462e36c: 54ffd9a0     	b.eq	0x462dea0 <_ChromeMain+0x4628c04>
 462e370: 39c07c29     	ldrsb	w9, [x1, #0x1f]
 462e374: 39425fe8     	ldrb	w8, [sp, #0x97]
 462e378: 37f80829     	tbnz	w9, #0x1f, 0x462e47c <_ChromeMain+0x46291e0>
 462e37c: 373800c8     	tbnz	w8, #0x7, 0x462e394 <_ChromeMain+0x46290f8>
 462e380: 3dc023e0     	ldr	q0, [sp, #0x80]
 462e384: f9404be8     	ldr	x8, [sp, #0x90]
 462e388: f9000808     	str	x8, [x0, #0x10]
 462e38c: 3d800000     	str	q0, [x0]
 462e390: 17fffec4     	b	0x462dea0 <_ChromeMain+0x4628c04>
 462e394: a9480be1     	ldp	x1, x2, [sp, #0x80]
 462e398: 96f9e9c7     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 462e39c: 17fffec1     	b	0x462dea0 <_ChromeMain+0x4628c04>
 462e3a0: 91002020     	add	x0, x1, #0x8
 462e3a4: 910203e8     	add	x8, sp, #0x80
 462e3a8: eb08001f     	cmp	x0, x8
 462e3ac: 54ffdac0     	b.eq	0x462df04 <_ChromeMain+0x4628c68>
 462e3b0: 39c07c29     	ldrsb	w9, [x1, #0x1f]
 462e3b4: 39425fe8     	ldrb	w8, [sp, #0x97]
 462e3b8: 37f80729     	tbnz	w9, #0x1f, 0x462e49c <_ChromeMain+0x4629200>
 462e3bc: 373800c8     	tbnz	w8, #0x7, 0x462e3d4 <_ChromeMain+0x4629138>
 462e3c0: 3dc023e0     	ldr	q0, [sp, #0x80]
 462e3c4: f9404be8     	ldr	x8, [sp, #0x90]
 462e3c8: f9000808     	str	x8, [x0, #0x10]
 462e3cc: 3d800000     	str	q0, [x0]
 462e3d0: 17fffecd     	b	0x462df04 <_ChromeMain+0x4628c68>
 462e3d4: a9480be1     	ldp	x1, x2, [sp, #0x80]
 462e3d8: 96f9e9b7     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 462e3dc: 17fffeca     	b	0x462df04 <_ChromeMain+0x4628c68>
 462e3e0: b40003f8     	cbz	x24, 0x462e45c <_ChromeMain+0x46291c0>
 462e3e4: 3dc022e0     	ldr	q0, [x23, #0x80]
 462e3e8: 3d800300     	str	q0, [x24]
 462e3ec: f9409be8     	ldr	x8, [sp, #0x130]
 462e3f0: f9000b08     	str	x8, [x24, #0x10]
 462e3f4: a912ffff     	stp	xzr, xzr, [sp, #0x128]
 462e3f8: f90093ff     	str	xzr, [sp, #0x120]
 462e3fc: 52827d08     	mov	w8, #0x13e8             ; =5096
 462e400: 8b080268     	add	x8, x19, x8
 462e404: f84182a9     	ldur	x9, [x21, #0x18]
 462e408: f909f669     	str	x9, [x19, #0x13e8]
 462e40c: f841d2a9     	ldur	x9, [x21, #0x1d]
 462e410: f8005109     	stur	x9, [x8, #0x5]
 462e414: 52800028     	mov	w8, #0x1                ; =1
 462e418: 390fe2c8     	strb	w8, [x22, #0x3f8]
 462e41c: 17fffe6b     	b	0x462ddc8 <_ChromeMain+0x4628b2c>
 462e420: f949ea60     	ldr	x0, [x19, #0x13d0]
 462e424: f949f268     	ldr	x8, [x19, #0x13e0]
 462e428: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e42c: 96e76aa3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462e430: 910483e8     	add	x8, sp, #0x120
 462e434: b94143ea     	ldr	w10, [sp, #0x140]
 462e438: 394513e9     	ldrb	w9, [sp, #0x144]
 462e43c: 17ffff66     	b	0x462e1d4 <_ChromeMain+0x4628f38>
 462e440: f949ea60     	ldr	x0, [x19, #0x13d0]
 462e444: f949f268     	ldr	x8, [x19, #0x13e0]
 462e448: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e44c: 96e76a9b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462e450: b94143e9     	ldr	w9, [sp, #0x140]
 462e454: 394513e8     	ldrb	w8, [sp, #0x144]
 462e458: 17fffe4e     	b	0x462dd90 <_ChromeMain+0x4628af4>
 462e45c: d4200020     	brk	#0x1
 462e460: 13001d09     	sxtb	w9, w8
 462e464: 7100013f     	cmp	w9, #0x0
 462e468: a9402aa9     	ldp	x9, x10, [x21]
 462e46c: 9a954121     	csel	x1, x9, x21, mi
 462e470: 9a884142     	csel	x2, x10, x8, mi
 462e474: 96f9e9e3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 462e478: 17ffffa4     	b	0x462e308 <_ChromeMain+0x462906c>
 462e47c: 13001d09     	sxtb	w9, w8
 462e480: 7100013f     	cmp	w9, #0x0
 462e484: 910203e9     	add	x9, sp, #0x80
 462e488: a9482fea     	ldp	x10, x11, [sp, #0x80]
 462e48c: 9a894141     	csel	x1, x10, x9, mi
 462e490: 9a884162     	csel	x2, x11, x8, mi
 462e494: 96f9e9db     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 462e498: 17fffe82     	b	0x462dea0 <_ChromeMain+0x4628c04>
 462e49c: 13001d09     	sxtb	w9, w8
 462e4a0: 7100013f     	cmp	w9, #0x0
 462e4a4: 910203e9     	add	x9, sp, #0x80
 462e4a8: a9482fea     	ldp	x10, x11, [sp, #0x80]
 462e4ac: 9a894141     	csel	x1, x10, x9, mi
 462e4b0: 9a884162     	csel	x2, x11, x8, mi
 462e4b4: 96f9e9d3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 462e4b8: 17fffe93     	b	0x462df04 <_ChromeMain+0x4628c68>
