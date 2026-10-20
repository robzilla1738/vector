
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4615c00: d10643ff     	sub	sp, sp, #0x190
 4615c04: a9136ffc     	stp	x28, x27, [sp, #0x130]
 4615c08: a91467fa     	stp	x26, x25, [sp, #0x140]
 4615c0c: a9155ff8     	stp	x24, x23, [sp, #0x150]
 4615c10: a91657f6     	stp	x22, x21, [sp, #0x160]
 4615c14: a9174ff4     	stp	x20, x19, [sp, #0x170]
 4615c18: a9187bfd     	stp	x29, x30, [sp, #0x180]
 4615c1c: 910603fd     	add	x29, sp, #0x180
 4615c20: aa0103f8     	mov	x24, x1
 4615c24: aa0003f3     	mov	x19, x0
 4615c28: f90083ff     	str	xzr, [sp, #0x100]
 4615c2c: 6f00e400     	movi.2d	v0, #0000000000000000
 4615c30: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 4615c34: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 4615c38: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 4615c3c: 3d8027e0     	str	q0, [sp, #0x90]
 4615c40: 910243e8     	add	x8, sp, #0x90
 4615c44: 940004ae     	bl	0x4616efc <_ChromeMain+0x4611c60>
 4615c48: 9123e260     	add	x0, x19, #0x8f8
 4615c4c: 910243e1     	add	x1, sp, #0x90
 4615c50: 96fad72f     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4615c54: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 4615c58: f90047ff     	str	xzr, [sp, #0x88]
 4615c5c: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4615c60: f9003bff     	str	xzr, [sp, #0x70]
 4615c64: 34000958     	cbz	w24, 0x4615d8c <_ChromeMain+0x4610af0>
 4615c68: f942a275     	ldr	x21, [x19, #0x540]
 4615c6c: b4000915     	cbz	x21, 0x4615d8c <_ChromeMain+0x4610af0>
 4615c70: f94062a8     	ldr	x8, [x21, #0xc0]
 4615c74: b5008548     	cbnz	x8, 0x4616d1c <_ChromeMain+0x4611a80>
 4615c78: f9429e60     	ldr	x0, [x19, #0x538]
 4615c7c: f0048661     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 4615c80: 913f2021     	add	x1, x1, #0xfc8
 4615c84: 9706ffff     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4615c88: f942ee68     	ldr	x8, [x19, #0x5d8]
 4615c8c: d37ced09     	lsl	x9, x8, #4
 4615c90: b90027f8     	str	w24, [sp, #0x24]
 4615c94: f9000fe0     	str	x0, [sp, #0x18]
 4615c98: b40006c9     	cbz	x9, 0x4615d70 <_ChromeMain+0x4610ad4>
 4615c9c: f942ea76     	ldr	x22, [x19, #0x5d0]
 4615ca0: 8b0812d4     	add	x20, x22, x8, lsl #4
 4615ca4: 52800315     	mov	w21, #0x18              ; =24
 4615ca8: b201f3f7     	mov	x23, #-0x5555555555555556 ; =-6148914691236517206
 4615cac: f2955577     	movk	x23, #0xaaab
 4615cb0: 14000010     	b	0x4615cf0 <_ChromeMain+0x4610a54>
 4615cb4: f942ee68     	ldr	x8, [x19, #0x5d8]
 4615cb8: d37ced09     	lsl	x9, x8, #4
 4615cbc: b40005a9     	cbz	x9, 0x4615d70 <_ChromeMain+0x4610ad4>
 4615cc0: d2800016     	mov	x22, #0x0               ; =0
 4615cc4: f942ea7a     	ldr	x26, [x19, #0x5d0]
 4615cc8: 8b081359     	add	x25, x26, x8, lsl #4
 4615ccc: b0052cfb     	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4615cd0: f90017f9     	str	x25, [sp, #0x28]
 4615cd4: 14000290     	b	0x4616714 <_ChromeMain+0x4611478>
 4615cd8: 9101e3e0     	add	x0, sp, #0x78
 4615cdc: aa1603e2     	mov	x2, x22
 4615ce0: 94003e2c     	bl	0x4625590 <_ChromeMain+0x46202f4>
 4615ce4: 910042d6     	add	x22, x22, #0x10
 4615ce8: eb1402df     	cmp	x22, x20
 4615cec: 54fffe40     	b.eq	0x4615cb4 <_ChromeMain+0x4610a18>
 4615cf0: f94002c8     	ldr	x8, [x22]
 4615cf4: b4ffff88     	cbz	x8, 0x4615ce4 <_ChromeMain+0x4610a48>
 4615cf8: f94006c9     	ldr	x9, [x22, #0x8]
 4615cfc: b4ffff49     	cbz	x9, 0x4615ce4 <_ChromeMain+0x4610a48>
 4615d00: a947afea     	ldp	x10, x11, [sp, #0x78]
 4615d04: 8b0b056c     	add	x12, x11, x11, lsl #1
 4615d08: d37df18c     	lsl	x12, x12, #3
 4615d0c: b40002ec     	cbz	x12, 0x4615d68 <_ChromeMain+0x4610acc>
 4615d10: 9343fd8c     	asr	x12, x12, #3
 4615d14: 9b177d8c     	mul	x12, x12, x23
 4615d18: aa0a03e1     	mov	x1, x10
 4615d1c: d341fd8d     	lsr	x13, x12, #1
 4615d20: 9b1505ae     	madd	x14, x13, x21, x1
 4615d24: f84185cf     	ldr	x15, [x14], #0x18
 4615d28: aa6c07f0     	mvn	x16, x12, lsr #1
 4615d2c: 8b10018c     	add	x12, x12, x16
 4615d30: eb0801ff     	cmp	x15, x8
 4615d34: 9a8d318c     	csel	x12, x12, x13, lo
 4615d38: 9a8131c1     	csel	x1, x14, x1, lo
 4615d3c: b5ffff0c     	cbnz	x12, 0x4615d1c <_ChromeMain+0x4610a80>
 4615d40: 9106e123     	add	x3, x9, #0x1b8
 4615d44: 9b152969     	madd	x9, x11, x21, x10
 4615d48: eb09003f     	cmp	x1, x9
 4615d4c: 54fffc60     	b.eq	0x4615cd8 <_ChromeMain+0x4610a3c>
 4615d50: f9400029     	ldr	x9, [x1]
 4615d54: eb09011f     	cmp	x8, x9
 4615d58: 54fffc03     	b.lo	0x4615cd8 <_ChromeMain+0x4610a3c>
 4615d5c: 3dc00060     	ldr	q0, [x3]
 4615d60: 3c808020     	stur	q0, [x1, #0x8]
 4615d64: 17ffffe0     	b	0x4615ce4 <_ChromeMain+0x4610a48>
 4615d68: aa0a03e1     	mov	x1, x10
 4615d6c: 17fffff5     	b	0x4615d40 <_ChromeMain+0x4610aa4>
 4615d70: d2800016     	mov	x22, #0x0               ; =0
 4615d74: f9400fe8     	ldr	x8, [sp, #0x18]
 4615d78: d360fd19     	lsr	x25, x8, #32
 4615d7c: f9429e60     	ldr	x0, [x19, #0x538]
 4615d80: 9760ede6     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 4615d84: b94027f8     	ldr	w24, [sp, #0x24]
 4615d88: 14000003     	b	0x4615d94 <_ChromeMain+0x4610af8>
 4615d8c: d2800016     	mov	x22, #0x0               ; =0
 4615d90: 52800019     	mov	w25, #0x0               ; =0
 4615d94: 52000301     	eor	w1, w24, #0x1
 4615d98: aa1303e0     	mov	x0, x19
 4615d9c: 97ffef1a     	bl	0x4611a04 <_ChromeMain+0x460c768>
 4615da0: f9429a75     	ldr	x21, [x19, #0x530]
 4615da4: b4000575     	cbz	x21, 0x4615e50 <_ChromeMain+0x4610bb4>
 4615da8: 394086a8     	ldrb	w8, [x21, #0x21]
 4615dac: 36000528     	tbz	w8, #0x0, 0x4615e50 <_ChromeMain+0x4610bb4>
 4615db0: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 4615db4: f9002fff     	str	xzr, [sp, #0x58]
 4615db8: d101e3a8     	sub	x8, x29, #0x78
 4615dbc: 91002108     	add	x8, x8, #0x8
 4615dc0: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 4615dc4: f81883a8     	stur	x8, [x29, #-0x78]
 4615dc8: f9401ea8     	ldr	x8, [x21, #0x38]
 4615dcc: f9001be8     	str	x8, [sp, #0x30]
 4615dd0: b5005d88     	cbnz	x8, 0x4616980 <_ChromeMain+0x46116e4>
 4615dd4: f94022a8     	ldr	x8, [x21, #0x40]
 4615dd8: f9001be8     	str	x8, [sp, #0x30]
 4615ddc: b5005ee8     	cbnz	x8, 0x46169b8 <_ChromeMain+0x461171c>
 4615de0: f94026a8     	ldr	x8, [x21, #0x48]
 4615de4: f9001be8     	str	x8, [sp, #0x30]
 4615de8: b5006048     	cbnz	x8, 0x46169f0 <_ChromeMain+0x4611754>
 4615dec: f9402aa8     	ldr	x8, [x21, #0x50]
 4615df0: b5007da8     	cbnz	x8, 0x4616da4 <_ChromeMain+0x4611b08>
 4615df4: f9402ea8     	ldr	x8, [x21, #0x58]
 4615df8: b5008008     	cbnz	x8, 0x4616df8 <_ChromeMain+0x4611b5c>
 4615dfc: f94032a8     	ldr	x8, [x21, #0x60]
 4615e00: b5008268     	cbnz	x8, 0x4616e4c <_ChromeMain+0x4611bb0>
 4615e04: f85903a1     	ldur	x1, [x29, #-0x70]
 4615e08: d101e3a8     	sub	x8, x29, #0x78
 4615e0c: f9001be8     	str	x8, [sp, #0x30]
 4615e10: 9100c3e0     	add	x0, sp, #0x30
 4615e14: 970ab0d0     	bl	0x8c2154 <_ChromeMain+0x8bceb8>
 4615e18: f942ee68     	ldr	x8, [x19, #0x5d8]
 4615e1c: b4000128     	cbz	x8, 0x4615e40 <_ChromeMain+0x4610ba4>
 4615e20: 52800035     	mov	w21, #0x1               ; =1
 4615e24: f9430668     	ldr	x8, [x19, #0x608]
 4615e28: b4001a28     	cbz	x8, 0x461616c <_ChromeMain+0x4610ed0>
 4615e2c: d2800017     	mov	x23, #0x0               ; =0
 4615e30: 52800094     	mov	w20, #0x4               ; =4
 4615e34: 90051f96     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 4615e38: 911222d6     	add	x22, x22, #0x488
 4615e3c: 140000b0     	b	0x46160fc <_ChromeMain+0x4610e60>
 4615e40: 395ba268     	ldrb	w8, [x19, #0x6e8]
 4615e44: 360061c8     	tbz	w8, #0x0, 0x4616a7c <_ChromeMain+0x46117e0>
 4615e48: 52800015     	mov	w21, #0x0               ; =0
 4615e4c: 17fffff6     	b	0x4615e24 <_ChromeMain+0x4610b88>
 4615e50: 395bc268     	ldrb	w8, [x19, #0x6f0]
 4615e54: 34000288     	cbz	w8, 0x4615ea4 <_ChromeMain+0x4610c08>
 4615e58: 391bc27f     	strb	wzr, [x19, #0x6f0]
 4615e5c: f9435e74     	ldr	x20, [x19, #0x6b8]
 4615e60: b4000234     	cbz	x20, 0x4615ea4 <_ChromeMain+0x4610c08>
 4615e64: 52800028     	mov	w8, #0x1                ; =1
 4615e68: b8280288     	ldadd	w8, w8, [x20]
 4615e6c: 7100011f     	cmp	w8, #0x0
 4615e70: 540076ed     	b.le	0x4616d4c <_ChromeMain+0x4611ab0>
 4615e74: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4615e78: 6b09011f     	cmp	w8, w9
 4615e7c: 540076e0     	b.eq	0x4616d58 <_ChromeMain+0x4611abc>
 4615e80: f9435e68     	ldr	x8, [x19, #0x6b8]
 4615e84: f9400508     	ldr	x8, [x8, #0x8]
 4615e88: aa1403e0     	mov	x0, x20
 4615e8c: 52800001     	mov	w1, #0x0                ; =0
 4615e90: d63f0100     	blr	x8
 4615e94: 12800008     	mov	w8, #-0x1               ; =-1
 4615e98: b8e80288     	ldaddal	w8, w8, [x20]
 4615e9c: 7100051f     	cmp	w8, #0x1
 4615ea0: 54007620     	b.eq	0x4616d64 <_ChromeMain+0x4611ac8>
 4615ea4: 395bc261     	ldrb	w1, [x19, #0x6f0]
 4615ea8: 39472268     	ldrb	w8, [x19, #0x1c8]
 4615eac: 6b08003f     	cmp	w1, w8
 4615eb0: 540000a0     	b.eq	0x4615ec4 <_ChromeMain+0x4610c28>
 4615eb4: f9400268     	ldr	x8, [x19]
 4615eb8: f9405108     	ldr	x8, [x8, #0xa0]
 4615ebc: aa1303e0     	mov	x0, x19
 4615ec0: d63f0100     	blr	x8
 4615ec4: f9429e60     	ldr	x0, [x19, #0x538]
 4615ec8: b40000a0     	cbz	x0, 0x4615edc <_ChromeMain+0x4610c40>
 4615ecc: 52800001     	mov	w1, #0x0                ; =0
 4615ed0: 97006969     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4615ed4: f9429e60     	ldr	x0, [x19, #0x538]
 4615ed8: 96fe2ca9     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4615edc: aa1303e0     	mov	x0, x19
 4615ee0: 52800001     	mov	w1, #0x0                ; =0
 4615ee4: 97006964     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4615ee8: f9400268     	ldr	x8, [x19]
 4615eec: f9418508     	ldr	x8, [x8, #0x308]
 4615ef0: aa1303e0     	mov	x0, x19
 4615ef4: d63f0100     	blr	x8
 4615ef8: aa1303e0     	mov	x0, x19
 4615efc: 96fe2ca0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4615f00: b4000316     	cbz	x22, 0x4615f60 <_ChromeMain+0x4610cc4>
 4615f04: f94037e8     	ldr	x8, [sp, #0x68]
 4615f08: d37ced09     	lsl	x9, x8, #4
 4615f0c: b4000209     	cbz	x9, 0x4615f4c <_ChromeMain+0x4610cb0>
 4615f10: 8b160129     	add	x9, x9, x22
 4615f14: d1004133     	sub	x19, x9, #0x10
 4615f18: cb0813f4     	neg	x20, x8, lsl #4
 4615f1c: 14000007     	b	0x4615f38 <_ChromeMain+0x4610c9c>
 4615f20: f9400008     	ldr	x8, [x0]
 4615f24: f9402908     	ldr	x8, [x8, #0x50]
 4615f28: d63f0100     	blr	x8
 4615f2c: d1004273     	sub	x19, x19, #0x10
 4615f30: b1004294     	adds	x20, x20, #0x10
 4615f34: 540000c0     	b.eq	0x4615f4c <_ChromeMain+0x4610cb0>
 4615f38: b4000633     	cbz	x19, 0x4615ffc <_ChromeMain+0x4610d60>
 4615f3c: f9400660     	ldr	x0, [x19, #0x8]
 4615f40: f900067f     	str	xzr, [x19, #0x8]
 4615f44: b4ffff40     	cbz	x0, 0x4615f2c <_ChromeMain+0x4610c90>
 4615f48: 17fffff6     	b	0x4615f20 <_ChromeMain+0x4610c84>
 4615f4c: f90037ff     	str	xzr, [sp, #0x68]
 4615f50: f9403be8     	ldr	x8, [sp, #0x70]
 4615f54: d37ced01     	lsl	x1, x8, #4
 4615f58: aa1603e0     	mov	x0, x22
 4615f5c: 96e7cbd7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4615f60: f9403fe0     	ldr	x0, [sp, #0x78]
 4615f64: b4000240     	cbz	x0, 0x4615fac <_ChromeMain+0x4610d10>
 4615f68: f94043e8     	ldr	x8, [sp, #0x80]
 4615f6c: 8b080509     	add	x9, x8, x8, lsl #1
 4615f70: d37df129     	lsl	x9, x9, #3
 4615f74: b4000129     	cbz	x9, 0x4615f98 <_ChromeMain+0x4610cfc>
 4615f78: d37df10a     	lsl	x10, x8, #3
 4615f7c: cb081548     	sub	x8, x10, x8, lsl #5
 4615f80: 8b000129     	add	x9, x9, x0
 4615f84: d1006129     	sub	x9, x9, #0x18
 4615f88: b40003a9     	cbz	x9, 0x4615ffc <_ChromeMain+0x4610d60>
 4615f8c: d1006129     	sub	x9, x9, #0x18
 4615f90: 91006108     	add	x8, x8, #0x18
 4615f94: b5ffffa8     	cbnz	x8, 0x4615f88 <_ChromeMain+0x4610cec>
 4615f98: f90043ff     	str	xzr, [sp, #0x80]
 4615f9c: f94047e8     	ldr	x8, [sp, #0x88]
 4615fa0: 8b080508     	add	x8, x8, x8, lsl #1
 4615fa4: d37df101     	lsl	x1, x8, #3
 4615fa8: 96e7cbc4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4615fac: 910243f3     	add	x19, sp, #0x90
 4615fb0: 9101c260     	add	x0, x19, #0x70
 4615fb4: d2800001     	mov	x1, #0x0                ; =0
 4615fb8: 96e84740     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4615fbc: 91008260     	add	x0, x19, #0x20
 4615fc0: 96e8472e     	bl	0x27c78 <_ChromeMain+0x229dc>
 4615fc4: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 4615fc8: 36f800a8     	tbz	w8, #0x1f, 0x4615fdc <_ChromeMain+0x4610d40>
 4615fcc: f9404be0     	ldr	x0, [sp, #0x90]
 4615fd0: f94053e8     	ldr	x8, [sp, #0xa0]
 4615fd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4615fd8: 96e7cbb8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4615fdc: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 4615fe0: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 4615fe4: a95657f6     	ldp	x22, x21, [sp, #0x160]
 4615fe8: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 4615fec: a95467fa     	ldp	x26, x25, [sp, #0x140]
 4615ff0: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 4615ff4: 910643ff     	add	sp, sp, #0x190
 4615ff8: d65f03c0     	ret
 4615ffc: d4200020     	brk	#0x1
 4616000: f9429e60     	ldr	x0, [x19, #0x538]
 4616004: b40000a0     	cbz	x0, 0x4616018 <_ChromeMain+0x4610d7c>
 4616008: 52800001     	mov	w1, #0x0                ; =0
 461600c: 9700691a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4616010: f9429e60     	ldr	x0, [x19, #0x538]
 4616014: 96fe2c5a     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4616018: aa1303e0     	mov	x0, x19
 461601c: 52800001     	mov	w1, #0x0                ; =0
 4616020: 97006915     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4616024: f9400268     	ldr	x8, [x19]
 4616028: f9418508     	ldr	x8, [x8, #0x308]
 461602c: aa1303e0     	mov	x0, x19
 4616030: d63f0100     	blr	x8
 4616034: aa1303e0     	mov	x0, x19
 4616038: 96fe2c51     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461603c: f9436274     	ldr	x20, [x19, #0x6c0]
 4616040: b4000214     	cbz	x20, 0x4616080 <_ChromeMain+0x4610de4>
 4616044: 52800028     	mov	w8, #0x1                ; =1
 4616048: b8280288     	ldadd	w8, w8, [x20]
 461604c: 7100011f     	cmp	w8, #0x0
 4616050: 5400692d     	b.le	0x4616d74 <_ChromeMain+0x4611ad8>
 4616054: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4616058: 6b09011f     	cmp	w8, w9
 461605c: 54006920     	b.eq	0x4616d80 <_ChromeMain+0x4611ae4>
 4616060: f9436268     	ldr	x8, [x19, #0x6c0]
 4616064: f9400508     	ldr	x8, [x8, #0x8]
 4616068: aa1403e0     	mov	x0, x20
 461606c: d63f0100     	blr	x8
 4616070: 12800008     	mov	w8, #-0x1               ; =-1
 4616074: b8e80288     	ldaddal	w8, w8, [x20]
 4616078: 7100051f     	cmp	w8, #0x1
 461607c: 54004f80     	b.eq	0x4616a6c <_ChromeMain+0x46117d0>
 4616080: f94027e0     	ldr	x0, [sp, #0x48]
 4616084: b5000080     	cbnz	x0, 0x4616094 <_ChromeMain+0x4610df8>
 4616088: f94033f6     	ldr	x22, [sp, #0x60]
 461608c: b4fff6b6     	cbz	x22, 0x4615f60 <_ChromeMain+0x4610cc4>
 4616090: 17ffff9d     	b	0x4615f04 <_ChromeMain+0x4610c68>
 4616094: f9402be8     	ldr	x8, [sp, #0x50]
 4616098: d37df109     	lsl	x9, x8, #3
 461609c: b4000109     	cbz	x9, 0x46160bc <_ChromeMain+0x4610e20>
 46160a0: cb080fe8     	neg	x8, x8, lsl #3
 46160a4: 8b000129     	add	x9, x9, x0
 46160a8: d1002129     	sub	x9, x9, #0x8
 46160ac: b4fffa89     	cbz	x9, 0x4615ffc <_ChromeMain+0x4610d60>
 46160b0: d1002129     	sub	x9, x9, #0x8
 46160b4: 91002108     	add	x8, x8, #0x8
 46160b8: b5ffffa8     	cbnz	x8, 0x46160ac <_ChromeMain+0x4610e10>
 46160bc: f9002bff     	str	xzr, [sp, #0x50]
 46160c0: f9402fe8     	ldr	x8, [sp, #0x58]
 46160c4: d37df101     	lsl	x1, x8, #3
 46160c8: 96e7cb7c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46160cc: 17ffffef     	b	0x4616088 <_ChromeMain+0x4610dec>
 46160d0: f10002ff     	cmp	x23, #0x0
 46160d4: 9a9403e8     	csel	x8, xzr, x20, eq
 46160d8: a938ffa8     	stp	x8, xzr, [x29, #-0x78]
 46160dc: 91036120     	add	x0, x9, #0xd8
 46160e0: d101e3a2     	sub	x2, x29, #0x78
 46160e4: aa1603e1     	mov	x1, x22
 46160e8: 97535f5e     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 46160ec: f9430668     	ldr	x8, [x19, #0x608]
 46160f0: 910006f7     	add	x23, x23, #0x1
 46160f4: eb0802ff     	cmp	x23, x8
 46160f8: 540003a2     	b.hs	0x461616c <_ChromeMain+0x4610ed0>
 46160fc: f9430269     	ldr	x9, [x19, #0x600]
 4616100: f8777929     	ldr	x9, [x9, x23, lsl #3]
 4616104: f942ea6a     	ldr	x10, [x19, #0x5d0]
 4616108: f942ee6c     	ldr	x12, [x19, #0x5d8]
 461610c: d37ced8b     	lsl	x11, x12, #4
 4616110: b40002ab     	cbz	x11, 0x4616164 <_ChromeMain+0x4610ec8>
 4616114: 9344fd6d     	asr	x13, x11, #4
 4616118: aa0a03eb     	mov	x11, x10
 461611c: d341fdae     	lsr	x14, x13, #1
 4616120: 8b0e116f     	add	x15, x11, x14, lsl #4
 4616124: f84105f0     	ldr	x16, [x15], #0x10
 4616128: aa6d07f1     	mvn	x17, x13, lsr #1
 461612c: 8b1101ad     	add	x13, x13, x17
 4616130: eb09021f     	cmp	x16, x9
 4616134: 9a8e31ad     	csel	x13, x13, x14, lo
 4616138: 9a8b31eb     	csel	x11, x15, x11, lo
 461613c: b5ffff0d     	cbnz	x13, 0x461611c <_ChromeMain+0x4610e80>
 4616140: 8b0c114a     	add	x10, x10, x12, lsl #4
 4616144: eb0a017f     	cmp	x11, x10
 4616148: 54fffd40     	b.eq	0x46160f0 <_ChromeMain+0x4610e54>
 461614c: f940016a     	ldr	x10, [x11]
 4616150: eb0a013f     	cmp	x9, x10
 4616154: 54fffce3     	b.lo	0x46160f0 <_ChromeMain+0x4610e54>
 4616158: f9400569     	ldr	x9, [x11, #0x8]
 461615c: b4fffca9     	cbz	x9, 0x46160f0 <_ChromeMain+0x4610e54>
 4616160: 17ffffdc     	b	0x46160d0 <_ChromeMain+0x4610e34>
 4616164: aa0a03eb     	mov	x11, x10
 4616168: 17fffff6     	b	0x4616140 <_ChromeMain+0x4610ea4>
 461616c: 395bc268     	ldrb	w8, [x19, #0x6f0]
 4616170: 6b15011f     	cmp	w8, w21
 4616174: 54000280     	b.eq	0x46161c4 <_ChromeMain+0x4610f28>
 4616178: 391bc275     	strb	w21, [x19, #0x6f0]
 461617c: f9435e76     	ldr	x22, [x19, #0x6b8]
 4616180: b4000236     	cbz	x22, 0x46161c4 <_ChromeMain+0x4610f28>
 4616184: 52800028     	mov	w8, #0x1                ; =1
 4616188: b82802c8     	ldadd	w8, w8, [x22]
 461618c: 7100011f     	cmp	w8, #0x0
 4616190: 54005fed     	b.le	0x4616d8c <_ChromeMain+0x4611af0>
 4616194: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4616198: 6b09011f     	cmp	w8, w9
 461619c: 54005fe0     	b.eq	0x4616d98 <_ChromeMain+0x4611afc>
 46161a0: f9435e68     	ldr	x8, [x19, #0x6b8]
 46161a4: f9400508     	ldr	x8, [x8, #0x8]
 46161a8: aa1603e0     	mov	x0, x22
 46161ac: aa1503e1     	mov	x1, x21
 46161b0: d63f0100     	blr	x8
 46161b4: 12800008     	mov	w8, #-0x1               ; =-1
 46161b8: b8e802c8     	ldaddal	w8, w8, [x22]
 46161bc: 7100051f     	cmp	w8, #0x1
 46161c0: 54006700     	b.eq	0x4616ea0 <_ChromeMain+0x4611c04>
 46161c4: 395bc261     	ldrb	w1, [x19, #0x6f0]
 46161c8: 39472268     	ldrb	w8, [x19, #0x1c8]
 46161cc: 6b08003f     	cmp	w1, w8
 46161d0: 540000a0     	b.eq	0x46161e4 <_ChromeMain+0x4610f48>
 46161d4: f9400268     	ldr	x8, [x19]
 46161d8: f9405108     	ldr	x8, [x8, #0xa0]
 46161dc: aa1303e0     	mov	x0, x19
 46161e0: d63f0100     	blr	x8
 46161e4: aa1303e0     	mov	x0, x19
 46161e8: 97fff4fd     	bl	0x46135dc <_ChromeMain+0x460e340>
 46161ec: aa1303e0     	mov	x0, x19
 46161f0: 97fff59d     	bl	0x4613864 <_ChromeMain+0x460e5c8>
 46161f4: f94043f7     	ldr	x23, [sp, #0x80]
 46161f8: f10002ff     	cmp	x23, #0x0
 46161fc: 1a9803e8     	csel	w8, wzr, w24, eq
 4616200: 3607f008     	tbz	w8, #0x0, 0x4616000 <_ChromeMain+0x4610d64>
 4616204: f942a268     	ldr	x8, [x19, #0x540]
 4616208: b4ffefc8     	cbz	x8, 0x4616000 <_ChromeMain+0x4610d64>
 461620c: f9429e60     	ldr	x0, [x19, #0x538]
 4616210: d0048661     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 4616214: 913f6021     	add	x1, x1, #0xfd8
 4616218: 9706fe9a     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 461621c: aa0003f4     	mov	x20, x0
 4616220: f9429e60     	ldr	x0, [x19, #0x538]
 4616224: b941c008     	ldr	w8, [x0, #0x1c0]
 4616228: 6b14011f     	cmp	w8, w20
 461622c: 1a94c11a     	csel	w26, w8, w20, gt
 4616230: 0aba7f48     	bic	w8, w26, w26, asr #31
 4616234: 0ab97f29     	bic	w9, w25, w25, asr #31
 4616238: aa098115     	orr	x21, x8, x9, lsl #32
 461623c: aa1503e1     	mov	x1, x21
 4616240: 52800022     	mov	w2, #0x1                ; =1
 4616244: 9786ee07     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4616248: 9121c268     	add	x8, x19, #0x870
 461624c: 3961e269     	ldrb	w9, [x19, #0x878]
 4616250: 350000c9     	cbnz	w9, 0x4616268 <_ChromeMain+0x4610fcc>
 4616254: b4ffed48     	cbz	x8, 0x4615ffc <_ChromeMain+0x4610d60>
 4616258: f9043a75     	str	x21, [x19, #0x870]
 461625c: 52800028     	mov	w8, #0x1                ; =1
 4616260: 3921e268     	strb	w8, [x19, #0x878]
 4616264: 14000002     	b	0x461626c <_ChromeMain+0x4610fd0>
 4616268: f9000115     	str	x21, [x8]
 461626c: d360fe9b     	lsr	x27, x20, #32
 4616270: f9429e60     	ldr	x0, [x19, #0x538]
 4616274: 52800001     	mov	w1, #0x0                ; =0
 4616278: 9700687f     	bl	0x630474 <_ChromeMain+0x62b1d8>
 461627c: f9429e60     	ldr	x0, [x19, #0x538]
 4616280: 970a3ded     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 4616284: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 4616288: f81983bf     	stur	xzr, [x29, #-0x68]
 461628c: f942ee68     	ldr	x8, [x19, #0x5d8]
 4616290: d37ced09     	lsl	x9, x8, #4
 4616294: b40005a9     	cbz	x9, 0x4616348 <_ChromeMain+0x46110ac>
 4616298: f942ea74     	ldr	x20, [x19, #0x5d0]
 461629c: 8b081295     	add	x21, x20, x8, lsl #4
 46162a0: 52800316     	mov	w22, #0x18              ; =24
 46162a4: b201f3f8     	mov	x24, #-0x5555555555555556 ; =-6148914691236517206
 46162a8: f2955578     	movk	x24, #0xaaab
 46162ac: 14000007     	b	0x46162c8 <_ChromeMain+0x461102c>
 46162b0: d101e3a0     	sub	x0, x29, #0x78
 46162b4: aa1403e2     	mov	x2, x20
 46162b8: 94003cb6     	bl	0x4625590 <_ChromeMain+0x46202f4>
 46162bc: 91004294     	add	x20, x20, #0x10
 46162c0: eb15029f     	cmp	x20, x21
 46162c4: 54003060     	b.eq	0x46168d0 <_ChromeMain+0x4611634>
 46162c8: f9400288     	ldr	x8, [x20]
 46162cc: b4ffff88     	cbz	x8, 0x46162bc <_ChromeMain+0x4611020>
 46162d0: f9400689     	ldr	x9, [x20, #0x8]
 46162d4: b4ffff49     	cbz	x9, 0x46162bc <_ChromeMain+0x4611020>
 46162d8: a978afaa     	ldp	x10, x11, [x29, #-0x78]
 46162dc: 8b0b056c     	add	x12, x11, x11, lsl #1
 46162e0: d37df18c     	lsl	x12, x12, #3
 46162e4: b40002ec     	cbz	x12, 0x4616340 <_ChromeMain+0x46110a4>
 46162e8: 9343fd8c     	asr	x12, x12, #3
 46162ec: 9b187d8c     	mul	x12, x12, x24
 46162f0: aa0a03e1     	mov	x1, x10
 46162f4: d341fd8d     	lsr	x13, x12, #1
 46162f8: 9b1605ae     	madd	x14, x13, x22, x1
 46162fc: f84185cf     	ldr	x15, [x14], #0x18
 4616300: aa6c07f0     	mvn	x16, x12, lsr #1
 4616304: 8b10018c     	add	x12, x12, x16
 4616308: eb0801ff     	cmp	x15, x8
 461630c: 9a8d318c     	csel	x12, x12, x13, lo
 4616310: 9a8131c1     	csel	x1, x14, x1, lo
 4616314: b5ffff0c     	cbnz	x12, 0x46162f4 <_ChromeMain+0x4611058>
 4616318: 9106e123     	add	x3, x9, #0x1b8
 461631c: 9b162969     	madd	x9, x11, x22, x10
 4616320: eb09003f     	cmp	x1, x9
 4616324: 54fffc60     	b.eq	0x46162b0 <_ChromeMain+0x4611014>
 4616328: f9400029     	ldr	x9, [x1]
 461632c: eb09011f     	cmp	x8, x9
 4616330: 54fffc03     	b.lo	0x46162b0 <_ChromeMain+0x4611014>
 4616334: 3dc00060     	ldr	q0, [x3]
 4616338: 3c808020     	stur	q0, [x1, #0x8]
 461633c: 17ffffe0     	b	0x46162bc <_ChromeMain+0x4611020>
 4616340: aa0a03e1     	mov	x1, x10
 4616344: 17fffff5     	b	0x4616318 <_ChromeMain+0x461107c>
 4616348: f9429e60     	ldr	x0, [x19, #0x538]
 461634c: f100001f     	cmp	x0, #0x0
 4616350: 7a5b1324     	ccmp	w25, w27, #0x4, ne
 4616354: 540002a0     	b.eq	0x46163a8 <_ChromeMain+0x461110c>
 4616358: 52800014     	mov	w20, #0x0               ; =0
 461635c: 39568268     	ldrb	w8, [x19, #0x5a0]
 4616360: 35004d68     	cbnz	w8, 0x4616d0c <_ChromeMain+0x4611a70>
 4616364: f902de7f     	str	xzr, [x19, #0x5b8]
 4616368: 39556268     	ldrb	w8, [x19, #0x558]
 461636c: 350049e8     	cbnz	w8, 0x4616ca8 <_ChromeMain+0x4611a0c>
 4616370: b9086679     	str	w25, [x19, #0x864]
 4616374: b9086a7b     	str	w27, [x19, #0x868]
 4616378: b9086e7a     	str	w26, [x19, #0x86c]
 461637c: 52800028     	mov	w8, #0x1                ; =1
 4616380: 39218e68     	strb	w8, [x19, #0x863]
 4616384: aa1303e0     	mov	x0, x19
 4616388: 97fffdce     	bl	0x4615ac0 <_ChromeMain+0x4610824>
 461638c: 91152260     	add	x0, x19, #0x548
 4616390: 52800001     	mov	w1, #0x0                ; =0
 4616394: 97762174     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4616398: 39618e68     	ldrb	w8, [x19, #0x863]
 461639c: 2a080288     	orr	w8, w20, w8
 46163a0: 37000128     	tbnz	w8, #0x0, 0x46163c4 <_ChromeMain+0x4611128>
 46163a4: f9429e60     	ldr	x0, [x19, #0x538]
 46163a8: b40000e0     	cbz	x0, 0x46163c4 <_ChromeMain+0x4611128>
 46163ac: 39618a68     	ldrb	w8, [x19, #0x862]
 46163b0: 370000a8     	tbnz	w8, #0x0, 0x46163c4 <_ChromeMain+0x4611128>
 46163b4: 39618e68     	ldrb	w8, [x19, #0x863]
 46163b8: 37000068     	tbnz	w8, #0x0, 0x46163c4 <_ChromeMain+0x4611128>
 46163bc: 395d0a68     	ldrb	w8, [x19, #0x742]
 46163c0: 36003348     	tbz	w8, #0x0, 0x4616a28 <_ChromeMain+0x461178c>
 46163c4: f85883a0     	ldur	x0, [x29, #-0x78]
 46163c8: b4ffe3a0     	cbz	x0, 0x461603c <_ChromeMain+0x4610da0>
 46163cc: f85903a8     	ldur	x8, [x29, #-0x70]
 46163d0: 8b080509     	add	x9, x8, x8, lsl #1
 46163d4: d37df129     	lsl	x9, x9, #3
 46163d8: b4000129     	cbz	x9, 0x46163fc <_ChromeMain+0x4611160>
 46163dc: d37df10a     	lsl	x10, x8, #3
 46163e0: cb081548     	sub	x8, x10, x8, lsl #5
 46163e4: 8b000129     	add	x9, x9, x0
 46163e8: d1006129     	sub	x9, x9, #0x18
 46163ec: b4ffe089     	cbz	x9, 0x4615ffc <_ChromeMain+0x4610d60>
 46163f0: d1006129     	sub	x9, x9, #0x18
 46163f4: 91006108     	add	x8, x8, #0x18
 46163f8: b5ffffa8     	cbnz	x8, 0x46163ec <_ChromeMain+0x4611150>
 46163fc: f81903bf     	stur	xzr, [x29, #-0x70]
 4616400: f85983a8     	ldur	x8, [x29, #-0x68]
 4616404: 8b080508     	add	x8, x8, x8, lsl #1
 4616408: d37df101     	lsl	x1, x8, #3
 461640c: 96e7caab     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4616410: 17ffff0b     	b	0x461603c <_ChromeMain+0x4610da0>
 4616414: f942ee69     	ldr	x9, [x19, #0x5d8]
 4616418: d37ced28     	lsl	x8, x9, #4
 461641c: f94017f9     	ldr	x25, [sp, #0x28]
 4616420: b94027fa     	ldr	w26, [sp, #0x24]
 4616424: f9400ffb     	ldr	x27, [sp, #0x18]
 4616428: b4fff908     	cbz	x8, 0x4616348 <_ChromeMain+0x46110ac>
 461642c: 52800008     	mov	w8, #0x0                ; =0
 4616430: f942ea74     	ldr	x20, [x19, #0x5d0]
 4616434: 8b091295     	add	x21, x20, x9, lsl #4
 4616438: 52800316     	mov	w22, #0x18              ; =24
 461643c: 14000004     	b	0x461644c <_ChromeMain+0x46111b0>
 4616440: 91004294     	add	x20, x20, #0x10
 4616444: eb15029f     	cmp	x20, x21
 4616448: 54002340     	b.eq	0x46168b0 <_ChromeMain+0x4611614>
 461644c: a940068a     	ldp	x10, x1, [x20]
 4616450: f100015f     	cmp	x10, #0x0
 4616454: fa401824     	ccmp	x1, #0x0, #0x4, ne
 4616458: 54ffff40     	b.eq	0x4616440 <_ChromeMain+0x46111a4>
 461645c: aa1803e9     	mov	x9, x24
 4616460: b4000190     	cbz	x16, 0x4616490 <_ChromeMain+0x46111f4>
 4616464: aa1803e9     	mov	x9, x24
 4616468: aa1103eb     	mov	x11, x17
 461646c: d341fd6c     	lsr	x12, x11, #1
 4616470: 9b16258d     	madd	x13, x12, x22, x9
 4616474: f84185ae     	ldr	x14, [x13], #0x18
 4616478: aa6b07ef     	mvn	x15, x11, lsr #1
 461647c: 8b0f016b     	add	x11, x11, x15
 4616480: eb0a01df     	cmp	x14, x10
 4616484: 9a8c316b     	csel	x11, x11, x12, lo
 4616488: 9a8931a9     	csel	x9, x13, x9, lo
 461648c: b5ffff0b     	cbnz	x11, 0x461646c <_ChromeMain+0x46111d0>
 4616490: eb00013f     	cmp	x9, x0
 4616494: 54fffd60     	b.eq	0x4616440 <_ChromeMain+0x46111a4>
 4616498: f940012b     	ldr	x11, [x9]
 461649c: eb0b015f     	cmp	x10, x11
 46164a0: 54fffd03     	b.lo	0x4616440 <_ChromeMain+0x46111a4>
 46164a4: b941b82a     	ldr	w10, [x1, #0x1b8]
 46164a8: b941bc2b     	ldr	w11, [x1, #0x1bc]
 46164ac: 2941352c     	ldp	w12, w13, [x9, #0x8]
 46164b0: 6b0c015f     	cmp	w10, w12
 46164b4: 7a4d0160     	ccmp	w11, w13, #0x0, eq
 46164b8: 54003da1     	b.ne	0x4616c6c <_ChromeMain+0x46119d0>
 46164bc: b941c02a     	ldr	w10, [x1, #0x1c0]
 46164c0: b941c42b     	ldr	w11, [x1, #0x1c4]
 46164c4: 2942352c     	ldp	w12, w13, [x9, #0x10]
 46164c8: 6b0c015f     	cmp	w10, w12
 46164cc: 7a4d0160     	ccmp	w11, w13, #0x0, eq
 46164d0: 54003ce1     	b.ne	0x4616c6c <_ChromeMain+0x46119d0>
 46164d4: 17ffffdb     	b	0x4616440 <_ChromeMain+0x46111a4>
 46164d8: 9100439c     	add	x28, x28, #0x10
 46164dc: eb16039f     	cmp	x28, x22
 46164e0: 54fff9a0     	b.eq	0x4616414 <_ChromeMain+0x4611178>
 46164e4: a9405388     	ldp	x8, x20, [x28]
 46164e8: f100011f     	cmp	x8, #0x0
 46164ec: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 46164f0: 54ffff40     	b.eq	0x46164d8 <_ChromeMain+0x461123c>
 46164f4: aa1803e9     	mov	x9, x24
 46164f8: b4000190     	cbz	x16, 0x4616528 <_ChromeMain+0x461128c>
 46164fc: aa1803e9     	mov	x9, x24
 4616500: aa1103ea     	mov	x10, x17
 4616504: d341fd4b     	lsr	x11, x10, #1
 4616508: 9b1b256c     	madd	x12, x11, x27, x9
 461650c: f841858d     	ldr	x13, [x12], #0x18
 4616510: aa6a07ee     	mvn	x14, x10, lsr #1
 4616514: 8b0e014a     	add	x10, x10, x14
 4616518: eb0801bf     	cmp	x13, x8
 461651c: 9a8b314a     	csel	x10, x10, x11, lo
 4616520: 9a893189     	csel	x9, x12, x9, lo
 4616524: b5ffff0a     	cbnz	x10, 0x4616504 <_ChromeMain+0x4611268>
 4616528: eb00013f     	cmp	x9, x0
 461652c: 54fffd60     	b.eq	0x46164d8 <_ChromeMain+0x461123c>
 4616530: f940012a     	ldr	x10, [x9]
 4616534: eb0a011f     	cmp	x8, x10
 4616538: 54fffd03     	b.lo	0x46164d8 <_ChromeMain+0x461123c>
 461653c: 3cc08120     	ldur	q0, [x9, #0x8]
 4616540: 3d800fe0     	str	q0, [sp, #0x30]
 4616544: aa1503ea     	mov	x10, x21
 4616548: b4000197     	cbz	x23, 0x4616578 <_ChromeMain+0x46112dc>
 461654c: aa1503ea     	mov	x10, x21
 4616550: aa1a03eb     	mov	x11, x26
 4616554: d341fd6c     	lsr	x12, x11, #1
 4616558: 9b1b298d     	madd	x13, x12, x27, x10
 461655c: f84185ae     	ldr	x14, [x13], #0x18
 4616560: aa6b07ef     	mvn	x15, x11, lsr #1
 4616564: 8b0f016b     	add	x11, x11, x15
 4616568: eb0801df     	cmp	x14, x8
 461656c: 9a8c316b     	csel	x11, x11, x12, lo
 4616570: 9a8a31aa     	csel	x10, x13, x10, lo
 4616574: b5ffff0b     	cbnz	x11, 0x4616554 <_ChromeMain+0x46112b8>
 4616578: eb19015f     	cmp	x10, x25
 461657c: a90043f1     	stp	x17, x16, [sp]
 4616580: f9000be0     	str	x0, [sp, #0x10]
 4616584: 54001d61     	b.ne	0x4616930 <_ChromeMain+0x4611694>
 4616588: b9400d29     	ldr	w9, [x9, #0xc]
 461658c: f9401d08     	ldr	x8, [x8, #0x38]
 4616590: b4001e28     	cbz	x8, 0x4616954 <_ChromeMain+0x46116b8>
 4616594: aa1503ea     	mov	x10, x21
 4616598: b4000197     	cbz	x23, 0x46165c8 <_ChromeMain+0x461132c>
 461659c: aa1503ea     	mov	x10, x21
 46165a0: aa1a03eb     	mov	x11, x26
 46165a4: d341fd6c     	lsr	x12, x11, #1
 46165a8: 9b1b298d     	madd	x13, x12, x27, x10
 46165ac: f84185ae     	ldr	x14, [x13], #0x18
 46165b0: aa6b07ef     	mvn	x15, x11, lsr #1
 46165b4: 8b0f016b     	add	x11, x11, x15
 46165b8: eb0801df     	cmp	x14, x8
 46165bc: 9a8c316b     	csel	x11, x11, x12, lo
 46165c0: 9a8a31aa     	csel	x10, x13, x10, lo
 46165c4: b5ffff0b     	cbnz	x11, 0x46165a4 <_ChromeMain+0x4611308>
 46165c8: eb19015f     	cmp	x10, x25
 46165cc: 54fffe00     	b.eq	0x461658c <_ChromeMain+0x46112f0>
 46165d0: f940014b     	ldr	x11, [x10]
 46165d4: eb0b011f     	cmp	x8, x11
 46165d8: 54fffda3     	b.lo	0x461658c <_ChromeMain+0x46112f0>
 46165dc: 140000db     	b	0x4616948 <_ChromeMain+0x46116ac>
 46165e0: d37ffaa8     	lsl	x8, x21, #1
 46165e4: f100051f     	cmp	x8, #0x1
 46165e8: 9a9f851b     	csinc	x27, x8, xzr, hi
 46165ec: d37cef60     	lsl	x0, x27, #4
 46165f0: 96e7e35e     	bl	0xf368 <_ChromeMain+0xa0cc>
 46165f4: d342ff68     	lsr	x8, x27, #2
 46165f8: 8b081014     	add	x20, x0, x8, lsl #4
 46165fc: b40004b9     	cbz	x25, 0x4616690 <_ChromeMain+0x46113f4>
 4616600: d37ceea1     	lsl	x1, x21, #4
 4616604: aa1903e0     	mov	x0, x25
 4616608: 96e7ca2c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461660c: 14000021     	b	0x4616690 <_ChromeMain+0x46113f4>
 4616610: d2800019     	mov	x25, #0x0               ; =0
 4616614: 14000012     	b	0x461665c <_ChromeMain+0x46113c0>
 4616618: cb160314     	sub	x20, x24, x22
 461661c: 91000528     	add	x8, x9, #0x1
 4616620: d37cfd0a     	lsr	x10, x8, #60
 4616624: b500378a     	cbnz	x10, 0x4616d14 <_ChromeMain+0x4611a78>
 4616628: d37ff92a     	lsl	x10, x9, #1
 461662c: eb08015f     	cmp	x10, x8
 4616630: 9a88815b     	csel	x27, x10, x8, hi
 4616634: 92ff0008     	mov	x8, #0x7ffffffffffffff  ; =576460752303423487
 4616638: eb08013f     	cmp	x9, x8
 461663c: 92fe0008     	mov	x8, #0xfffffffffffffff  ; =1152921504606846975
 4616640: 9a883375     	csel	x21, x27, x8, lo
 4616644: b4fffe75     	cbz	x21, 0x4616610 <_ChromeMain+0x4611374>
 4616648: d37cfea8     	lsr	x8, x21, #60
 461664c: b5003668     	cbnz	x8, 0x4616d18 <_ChromeMain+0x4611a7c>
 4616650: d37ceea0     	lsl	x0, x21, #4
 4616654: 96e7e345     	bl	0xf368 <_ChromeMain+0xa0cc>
 4616658: aa0003f9     	mov	x25, x0
 461665c: 8b14033c     	add	x28, x25, x20
 4616660: eb9412bf     	cmp	x21, x20, asr #4
 4616664: 54000121     	b.ne	0x4616688 <_ChromeMain+0x46113ec>
 4616668: eb16031f     	cmp	x24, x22
 461666c: 54fffba0     	b.eq	0x46165e0 <_ChromeMain+0x4611344>
 4616670: d37df2a8     	lsl	x8, x21, #3
 4616674: 91002108     	add	x8, x8, #0x8
 4616678: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 461667c: cb080394     	sub	x20, x28, x8
 4616680: aa1403fc     	mov	x28, x20
 4616684: 14000003     	b	0x4616690 <_ChromeMain+0x46113f4>
 4616688: aa1503fb     	mov	x27, x21
 461668c: aa1c03f4     	mov	x20, x28
 4616690: b4ffcb7c     	cbz	x28, 0x4615ffc <_ChromeMain+0x4610d60>
 4616694: f9400348     	ldr	x8, [x26]
 4616698: a9005f88     	stp	x8, x23, [x28]
 461669c: 91004380     	add	x0, x28, #0x10
 46166a0: cb140015     	sub	x21, x0, x20
 46166a4: a94627e8     	ldp	x8, x9, [sp, #0x60]
 46166a8: 8b091108     	add	x8, x8, x9, lsl #4
 46166ac: cb180116     	sub	x22, x8, x24
 46166b0: aa1803e1     	mov	x1, x24
 46166b4: aa1603e2     	mov	x2, x22
 46166b8: 94e7cd90     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 46166bc: 9344fec8     	asr	x8, x22, #4
 46166c0: 8b951115     	add	x21, x8, x21, asr #4
 46166c4: a94623e1     	ldp	x1, x8, [sp, #0x60]
 46166c8: cb961108     	sub	x8, x8, x22, asr #4
 46166cc: f90037e8     	str	x8, [sp, #0x68]
 46166d0: cb081296     	sub	x22, x20, x8, lsl #4
 46166d4: cb010302     	sub	x2, x24, x1
 46166d8: aa1603e0     	mov	x0, x22
 46166dc: 94e7cd87     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 46166e0: a94623e0     	ldp	x0, x8, [sp, #0x60]
 46166e4: 8b0802a8     	add	x8, x21, x8
 46166e8: a90623f6     	stp	x22, x8, [sp, #0x60]
 46166ec: f9403be8     	ldr	x8, [sp, #0x70]
 46166f0: f9003bfb     	str	x27, [sp, #0x70]
 46166f4: b4000060     	cbz	x0, 0x4616700 <_ChromeMain+0x4611464>
 46166f8: d37ced01     	lsl	x1, x8, #4
 46166fc: 96e7c9ef     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4616700: f94017f9     	ldr	x25, [sp, #0x28]
 4616704: 90052cfb     	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4616708: 9100435a     	add	x26, x26, #0x10
 461670c: eb19035f     	cmp	x26, x25
 4616710: 54ffb320     	b.eq	0x4615d74 <_ChromeMain+0x4610ad8>
 4616714: f9400348     	ldr	x8, [x26]
 4616718: b4ffff88     	cbz	x8, 0x4616708 <_ChromeMain+0x461146c>
 461671c: f9400757     	ldr	x23, [x26, #0x8]
 4616720: b4ffff57     	cbz	x23, 0x4616708 <_ChromeMain+0x461146c>
 4616724: f9429e76     	ldr	x22, [x19, #0x538]
 4616728: 925e76f4     	and	x20, x23, #0xfffffffc00000000
 461672c: f9404768     	ldr	x8, [x27, #0x88]
 4616730: eb08029f     	cmp	x20, x8
 4616734: 54000061     	b.ne	0x4616740 <_ChromeMain+0x46114a4>
 4616738: aa1703e0     	mov	x0, x23
 461673c: 96e7f6f0     	bl	0x142fc <_ChromeMain+0xf060>
 4616740: 3945a6e8     	ldrb	w8, [x23, #0x169]
 4616744: 35002fe8     	cbnz	w8, 0x4616d40 <_ChromeMain+0x4611aa4>
 4616748: aa1603e0     	mov	x0, x22
 461674c: aa1703e1     	mov	x1, x23
 4616750: 52800022     	mov	w2, #0x1                ; =1
 4616754: 52800003     	mov	w3, #0x0                ; =0
 4616758: d2800004     	mov	x4, #0x0                ; =0
 461675c: 9760ebb3     	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 4616760: f9404768     	ldr	x8, [x27, #0x88]
 4616764: eb08029f     	cmp	x20, x8
 4616768: 54000061     	b.ne	0x4616774 <_ChromeMain+0x46114d8>
 461676c: aa1703e0     	mov	x0, x23
 4616770: 96e830b3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4616774: a94627f6     	ldp	x22, x9, [sp, #0x60]
 4616778: d37ced28     	lsl	x8, x9, #4
 461677c: aa1603f8     	mov	x24, x22
 4616780: b40001a8     	cbz	x8, 0x46167b4 <_ChromeMain+0x4611518>
 4616784: 9344fd0b     	asr	x11, x8, #4
 4616788: f940034a     	ldr	x10, [x26]
 461678c: aa1603f8     	mov	x24, x22
 4616790: d341fd6c     	lsr	x12, x11, #1
 4616794: 8b0c130d     	add	x13, x24, x12, lsl #4
 4616798: f84105ae     	ldr	x14, [x13], #0x10
 461679c: aa6b07ef     	mvn	x15, x11, lsr #1
 46167a0: 8b0f016b     	add	x11, x11, x15
 46167a4: eb0a01df     	cmp	x14, x10
 46167a8: 9a8c316b     	csel	x11, x11, x12, lo
 46167ac: 9a9831b8     	csel	x24, x13, x24, lo
 46167b0: b5ffff0b     	cbnz	x11, 0x4616790 <_ChromeMain+0x46114f4>
 46167b4: 8b0802ca     	add	x10, x22, x8
 46167b8: eb0a031f     	cmp	x24, x10
 46167bc: 54000180     	b.eq	0x46167ec <_ChromeMain+0x4611550>
 46167c0: f9400355     	ldr	x21, [x26]
 46167c4: f940030b     	ldr	x11, [x24]
 46167c8: eb0b02bf     	cmp	x21, x11
 46167cc: 540002a3     	b.lo	0x4616820 <_ChromeMain+0x4611584>
 46167d0: f9400700     	ldr	x0, [x24, #0x8]
 46167d4: f9000717     	str	x23, [x24, #0x8]
 46167d8: b4fff980     	cbz	x0, 0x4616708 <_ChromeMain+0x461146c>
 46167dc: f9400008     	ldr	x8, [x0]
 46167e0: f9402908     	ldr	x8, [x8, #0x50]
 46167e4: d63f0100     	blr	x8
 46167e8: 17ffffc8     	b	0x4616708 <_ChromeMain+0x461146c>
 46167ec: f9403bea     	ldr	x10, [sp, #0x70]
 46167f0: eb0a013f     	cmp	x9, x10
 46167f4: 54fff120     	b.eq	0x4616618 <_ChromeMain+0x461137c>
 46167f8: b4ffc038     	cbz	x24, 0x4615ffc <_ChromeMain+0x4610d60>
 46167fc: f9400349     	ldr	x9, [x26]
 4616800: a9005f09     	stp	x9, x23, [x24]
 4616804: 91004108     	add	x8, x8, #0x10
 4616808: 9344fd08     	asr	x8, x8, #4
 461680c: f90037e8     	str	x8, [sp, #0x68]
 4616810: 17ffffbe     	b	0x4616708 <_ChromeMain+0x461146c>
 4616814: f9400700     	ldr	x0, [x24, #0x8]
 4616818: f9000315     	str	x21, [x24]
 461681c: 17ffffee     	b	0x46167d4 <_ChromeMain+0x4611538>
 4616820: cb160314     	sub	x20, x24, x22
 4616824: f9403beb     	ldr	x11, [sp, #0x70]
 4616828: eb0b013f     	cmp	x9, x11
 461682c: 54ffef80     	b.eq	0x461661c <_ChromeMain+0x4611380>
 4616830: d1004149     	sub	x9, x10, #0x10
 4616834: 8b0802cb     	add	x11, x22, x8
 4616838: eb0a013f     	cmp	x9, x10
 461683c: 54000102     	b.hs	0x461685c <_ChromeMain+0x46115c0>
 4616840: b4ffbdeb     	cbz	x11, 0x4615ffc <_ChromeMain+0x4610d60>
 4616844: a97f356c     	ldp	x12, x13, [x11, #-0x10]
 4616848: a93fb17f     	stp	xzr, x12, [x11, #-0x8]
 461684c: f900056d     	str	x13, [x11, #0x8]
 4616850: eb0a017f     	cmp	x11, x10
 4616854: 9100416b     	add	x11, x11, #0x10
 4616858: 54ffff43     	b.lo	0x4616840 <_ChromeMain+0x46115a4>
 461685c: cb16016a     	sub	x10, x11, x22
 4616860: 9344fd4a     	asr	x10, x10, #4
 4616864: f90037ea     	str	x10, [sp, #0x68]
 4616868: 9100428a     	add	x10, x20, #0x10
 461686c: eb0a011f     	cmp	x8, x10
 4616870: 54fffd20     	b.eq	0x4616814 <_ChromeMain+0x4611578>
 4616874: aa0903f4     	mov	x20, x9
 4616878: 14000007     	b	0x4616894 <_ChromeMain+0x46115f8>
 461687c: f9400008     	ldr	x8, [x0]
 4616880: f9402908     	ldr	x8, [x8, #0x50]
 4616884: d63f0100     	blr	x8
 4616888: aa1403e9     	mov	x9, x20
 461688c: eb18029f     	cmp	x20, x24
 4616890: 54fffc20     	b.eq	0x4616814 <_ChromeMain+0x4611578>
 4616894: f85f0e88     	ldr	x8, [x20, #-0x10]!
 4616898: f85f812a     	ldur	x10, [x9, #-0x8]
 461689c: a93fa13f     	stp	xzr, x8, [x9, #-0x8]
 46168a0: f9400520     	ldr	x0, [x9, #0x8]
 46168a4: f900052a     	str	x10, [x9, #0x8]
 46168a8: b4ffff00     	cbz	x0, 0x4616888 <_ChromeMain+0x46115ec>
 46168ac: 17fffff4     	b	0x461687c <_ChromeMain+0x46115e0>
 46168b0: 3607d4c8     	tbz	w8, #0x0, 0x4616348 <_ChromeMain+0x46110ac>
 46168b4: 52800034     	mov	w20, #0x1               ; =1
 46168b8: 39218a74     	strb	w20, [x19, #0x862]
 46168bc: 6b1b033f     	cmp	w25, w27
 46168c0: 54ffd820     	b.eq	0x46163c4 <_ChromeMain+0x4611128>
 46168c4: f9429e68     	ldr	x8, [x19, #0x538]
 46168c8: b5ffd4a8     	cbnz	x8, 0x461635c <_ChromeMain+0x46110c0>
 46168cc: 17fffebe     	b	0x46163c4 <_ChromeMain+0x4611128>
 46168d0: f942ee68     	ldr	x8, [x19, #0x5d8]
 46168d4: d37ced09     	lsl	x9, x8, #4
 46168d8: b4ffd389     	cbz	x9, 0x4616348 <_ChromeMain+0x46110ac>
 46168dc: f9000ffb     	str	x27, [sp, #0x18]
 46168e0: b90027fa     	str	w26, [sp, #0x24]
 46168e4: f90017f9     	str	x25, [sp, #0x28]
 46168e8: f942ea7c     	ldr	x28, [x19, #0x5d0]
 46168ec: 8b081396     	add	x22, x28, x8, lsl #4
 46168f0: a978a3b8     	ldp	x24, x8, [x29, #-0x78]
 46168f4: 8b080508     	add	x8, x8, x8, lsl #1
 46168f8: d37df110     	lsl	x16, x8, #3
 46168fc: 9340f109     	sbfx	x9, x8, #0, #61
 4616900: b201f3ea     	mov	x10, #-0x5555555555555556 ; =-6148914691236517206
 4616904: f295556a     	movk	x10, #0xaaab
 4616908: 9b0a7d31     	mul	x17, x9, x10
 461690c: 8b080f00     	add	x0, x24, x8, lsl #3
 4616910: f9403ff5     	ldr	x21, [sp, #0x78]
 4616914: 8b1706e8     	add	x8, x23, x23, lsl #1
 4616918: d37df117     	lsl	x23, x8, #3
 461691c: 9340f109     	sbfx	x9, x8, #0, #61
 4616920: 9b0a7d3a     	mul	x26, x9, x10
 4616924: 8b080eb9     	add	x25, x21, x8, lsl #3
 4616928: 5280031b     	mov	w27, #0x18              ; =24
 461692c: 17fffeee     	b	0x46164e4 <_ChromeMain+0x4611248>
 4616930: f940014b     	ldr	x11, [x10]
 4616934: eb0b011f     	cmp	x8, x11
 4616938: 54ffe283     	b.lo	0x4616588 <_ChromeMain+0x46112ec>
 461693c: 3cc08140     	ldur	q0, [x10, #0x8]
 4616940: 3d800fe0     	str	q0, [sp, #0x30]
 4616944: 14000006     	b	0x461695c <_ChromeMain+0x46116c0>
 4616948: b9400d48     	ldr	w8, [x10, #0xc]
 461694c: b9401549     	ldr	w9, [x10, #0x14]
 4616950: 0b080129     	add	w9, w9, w8
 4616954: b90037e9     	str	w9, [sp, #0x34]
 4616958: b9003fff     	str	wzr, [sp, #0x3c]
 461695c: f942a260     	ldr	x0, [x19, #0x540]
 4616960: aa1403e1     	mov	x1, x20
 4616964: 95811af9     	bl	0xa65d548 <_ChromeMain+0xa6582ac>
 4616968: 9100c3e1     	add	x1, sp, #0x30
 461696c: aa1403e0     	mov	x0, x20
 4616970: 970a3888     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4616974: a94043f1     	ldp	x17, x16, [sp]
 4616978: f9400be0     	ldr	x0, [sp, #0x10]
 461697c: 17fffed7     	b	0x46164d8 <_ChromeMain+0x461123c>
 4616980: d101e3a0     	sub	x0, x29, #0x78
 4616984: d101e3a1     	sub	x1, x29, #0x78
 4616988: 9100c3e2     	add	x2, sp, #0x30
 461698c: 949a4f95     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4616990: 3607a221     	tbz	w1, #0x0, 0x4615dd4 <_ChromeMain+0x4610b38>
 4616994: f9401be1     	ldr	x1, [sp, #0x30]
 4616998: 7100031f     	cmp	w24, #0x0
 461699c: 910183e8     	add	x8, sp, #0x60
 46169a0: 9a9f1104     	csel	x4, x8, xzr, ne
 46169a4: 910123e3     	add	x3, sp, #0x48
 46169a8: aa1303e0     	mov	x0, x19
 46169ac: 52800002     	mov	w2, #0x0                ; =0
 46169b0: 94000250     	bl	0x46172f0 <_ChromeMain+0x4612054>
 46169b4: 17fffd08     	b	0x4615dd4 <_ChromeMain+0x4610b38>
 46169b8: d101e3a0     	sub	x0, x29, #0x78
 46169bc: d101e3a1     	sub	x1, x29, #0x78
 46169c0: 9100c3e2     	add	x2, sp, #0x30
 46169c4: 949a4f87     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 46169c8: 3607a0c1     	tbz	w1, #0x0, 0x4615de0 <_ChromeMain+0x4610b44>
 46169cc: f9401be1     	ldr	x1, [sp, #0x30]
 46169d0: 7100031f     	cmp	w24, #0x0
 46169d4: 910183e8     	add	x8, sp, #0x60
 46169d8: 9a9f1104     	csel	x4, x8, xzr, ne
 46169dc: 910123e3     	add	x3, sp, #0x48
 46169e0: aa1303e0     	mov	x0, x19
 46169e4: 52800002     	mov	w2, #0x0                ; =0
 46169e8: 94000242     	bl	0x46172f0 <_ChromeMain+0x4612054>
 46169ec: 17fffcfd     	b	0x4615de0 <_ChromeMain+0x4610b44>
 46169f0: d101e3a0     	sub	x0, x29, #0x78
 46169f4: d101e3a1     	sub	x1, x29, #0x78
 46169f8: 9100c3e2     	add	x2, sp, #0x30
 46169fc: 949a4f79     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4616a00: 36079f61     	tbz	w1, #0x0, 0x4615dec <_ChromeMain+0x4610b50>
 4616a04: f9401be1     	ldr	x1, [sp, #0x30]
 4616a08: 7100031f     	cmp	w24, #0x0
 4616a0c: 910183e8     	add	x8, sp, #0x60
 4616a10: 9a9f1104     	csel	x4, x8, xzr, ne
 4616a14: 910123e3     	add	x3, sp, #0x48
 4616a18: aa1303e0     	mov	x0, x19
 4616a1c: 52800002     	mov	w2, #0x0                ; =0
 4616a20: 94000234     	bl	0x46172f0 <_ChromeMain+0x4612054>
 4616a24: 17fffcf2     	b	0x4615dec <_ChromeMain+0x4610b50>
 4616a28: d2800001     	mov	x1, #0x0                ; =0
 4616a2c: d2800002     	mov	x2, #0x0                ; =0
 4616a30: 9786ec0c     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4616a34: 3961e268     	ldrb	w8, [x19, #0x878]
 4616a38: 34000048     	cbz	w8, 0x4616a40 <_ChromeMain+0x46117a4>
 4616a3c: 3921e27f     	strb	wzr, [x19, #0x878]
 4616a40: f9429e60     	ldr	x0, [x19, #0x538]
 4616a44: 52800001     	mov	w1, #0x0                ; =0
 4616a48: 9700668b     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4616a4c: aa1303e0     	mov	x0, x19
 4616a50: 52800001     	mov	w1, #0x0                ; =0
 4616a54: 97006688     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4616a58: f9400268     	ldr	x8, [x19]
 4616a5c: f9418508     	ldr	x8, [x8, #0x308]
 4616a60: aa1303e0     	mov	x0, x19
 4616a64: d63f0100     	blr	x8
 4616a68: 17fffe57     	b	0x46163c4 <_ChromeMain+0x4611128>
 4616a6c: f9400a88     	ldr	x8, [x20, #0x10]
 4616a70: aa1403e0     	mov	x0, x20
 4616a74: d63f0100     	blr	x8
 4616a78: 17fffd82     	b	0x4616080 <_ChromeMain+0x4610de4>
 4616a7c: 900547b4     	adrp	x20, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4616a80: 91120294     	add	x20, x20, #0x480
 4616a84: f8bfc280     	ldapr	x0, [x20]
 4616a88: b4002140     	cbz	x0, 0x4616eb0 <_ChromeMain+0x4611c14>
 4616a8c: 52806301     	mov	w1, #0x318              ; =792
 4616a90: d2800002     	mov	x2, #0x0                ; =0
 4616a94: 96ea52c7     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4616a98: aa0003f5     	mov	x21, x0
 4616a9c: 973561a9     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4616aa0: f0050848     	adrp	x8, 0xe721000 <dyld_stub_binder+0xe721000>
 4616aa4: 9122c108     	add	x8, x8, #0x8b0
 4616aa8: 910fa109     	add	x9, x8, #0x3e8
 4616aac: a9002408     	stp	x8, x9, [x0]
 4616ab0: 91104109     	add	x9, x8, #0x410
 4616ab4: f9000809     	str	x9, [x0, #0x10]
 4616ab8: 91112109     	add	x9, x8, #0x448
 4616abc: 9111e10a     	add	x10, x8, #0x478
 4616ac0: a906a809     	stp	x9, x10, [x0, #0x68]
 4616ac4: 91132109     	add	x9, x8, #0x4c8
 4616ac8: f9005809     	str	x9, [x0, #0xb0]
 4616acc: 9114a109     	add	x9, x8, #0x528
 4616ad0: f9006c09     	str	x9, [x0, #0xd8]
 4616ad4: 91156108     	add	x8, x8, #0x558
 4616ad8: f9007c08     	str	x8, [x0, #0xf8]
 4616adc: f901881f     	str	xzr, [x0, #0x310]
 4616ae0: f8bfc280     	ldapr	x0, [x20]
 4616ae4: b4001ea0     	cbz	x0, 0x4616eb8 <_ChromeMain+0x4611c1c>
 4616ae8: 52808c01     	mov	w1, #0x460              ; =1120
 4616aec: d2800002     	mov	x2, #0x0                ; =0
 4616af0: 96ea52b0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4616af4: aa0003f6     	mov	x22, x0
 4616af8: d2800001     	mov	x1, #0x0                ; =0
 4616afc: d2800002     	mov	x2, #0x0                ; =0
 4616b00: 528000a3     	mov	w3, #0x5                ; =5
 4616b04: 52820004     	mov	w4, #0x1000             ; =4096
 4616b08: 52800005     	mov	w5, #0x0                ; =0
 4616b0c: 9755cf75     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4616b10: 3945a408     	ldrb	w8, [x0, #0x169]
 4616b14: 35001d68     	cbnz	w8, 0x4616ec0 <_ChromeMain+0x4611c24>
 4616b18: f940cea2     	ldr	x2, [x21, #0x198]
 4616b1c: aa1503e0     	mov	x0, x21
 4616b20: aa1603e1     	mov	x1, x22
 4616b24: 97058a36     	bl	0x7793fc <_ChromeMain+0x774160>
 4616b28: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4616b2c: 90052cf4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4616b30: f9404689     	ldr	x9, [x20, #0x88]
 4616b34: eb09011f     	cmp	x8, x9
 4616b38: 54000061     	b.ne	0x4616b44 <_ChromeMain+0x46118a8>
 4616b3c: aa1603e0     	mov	x0, x22
 4616b40: 96e7f5ef     	bl	0x142fc <_ChromeMain+0xf060>
 4616b44: f9418aa0     	ldr	x0, [x21, #0x310]
 4616b48: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4616b4c: f9404689     	ldr	x9, [x20, #0x88]
 4616b50: eb09011f     	cmp	x8, x9
 4616b54: 54000041     	b.ne	0x4616b5c <_ChromeMain+0x46118c0>
 4616b58: 96e82fb9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4616b5c: f9018ab6     	str	x22, [x21, #0x310]
 4616b60: f94002c8     	ldr	x8, [x22]
 4616b64: f941f108     	ldr	x8, [x8, #0x3e0]
 4616b68: b004cb81     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4616b6c: 9126a821     	add	x1, x1, #0x9aa
 4616b70: aa1603e0     	mov	x0, x22
 4616b74: 528003e2     	mov	w2, #0x1f               ; =31
 4616b78: d63f0100     	blr	x8
 4616b7c: f9418aa0     	ldr	x0, [x21, #0x310]
 4616b80: 52801bc8     	mov	w8, #0xde               ; =222
 4616b84: b90033e8     	str	w8, [sp, #0x30]
 4616b88: 3900d3ff     	strb	wzr, [sp, #0x34]
 4616b8c: f9400008     	ldr	x8, [x0]
 4616b90: f941f508     	ldr	x8, [x8, #0x3e8]
 4616b94: 9100c3e1     	add	x1, sp, #0x30
 4616b98: d63f0100     	blr	x8
 4616b9c: f9418aa0     	ldr	x0, [x21, #0x310]
 4616ba0: 52800034     	mov	w20, #0x1               ; =1
 4616ba4: 52800021     	mov	w1, #0x1                ; =1
 4616ba8: 9755cc56     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4616bac: f9418aa0     	ldr	x0, [x21, #0x310]
 4616bb0: 52800021     	mov	w1, #0x1                ; =1
 4616bb4: 9581c3e3     	bl	0xa687b40 <_ChromeMain+0xa6828a4>
 4616bb8: f9418ab6     	ldr	x22, [x21, #0x310]
 4616bbc: 394edac8     	ldrb	w8, [x22, #0x3b6]
 4616bc0: 35000408     	cbnz	w8, 0x4616c40 <_ChromeMain+0x46119a4>
 4616bc4: aa1603e0     	mov	x0, x22
 4616bc8: 52800001     	mov	w1, #0x0                ; =0
 4616bcc: 9784a1e9     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4616bd0: f9418aa0     	ldr	x0, [x21, #0x310]
 4616bd4: b81a03bf     	stur	wzr, [x29, #-0x60]
 4616bd8: 381a43b4     	sturb	w20, [x29, #-0x5c]
 4616bdc: d10183a1     	sub	x1, x29, #0x60
 4616be0: 9708c6c4     	bl	0x8486f0 <_ChromeMain+0x843454>
 4616be4: f9418aa0     	ldr	x0, [x21, #0x310]
 4616be8: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 4616bec: f81983bf     	stur	xzr, [x29, #-0x68]
 4616bf0: d101e3a1     	sub	x1, x29, #0x78
 4616bf4: 9708bf54     	bl	0x846944 <_ChromeMain+0x8416a8>
 4616bf8: 38d9f3a8     	ldursb	w8, [x29, #-0x61]
 4616bfc: 36f800a8     	tbz	w8, #0x1f, 0x4616c10 <_ChromeMain+0x4611974>
 4616c00: f85883a0     	ldur	x0, [x29, #-0x78]
 4616c04: f85983a8     	ldur	x8, [x29, #-0x68]
 4616c08: d37ff901     	lsl	x1, x8, #1
 4616c0c: 96e7c8ab     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4616c10: aa1503e0     	mov	x0, x21
 4616c14: d2800021     	mov	x1, #0x1                ; =1
 4616c18: f2c00741     	movk	x1, #0x3a, lsl #32
 4616c1c: 52800022     	mov	w2, #0x1                ; =1
 4616c20: 9786eb90     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4616c24: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4616c28: 35001528     	cbnz	w8, 0x4616ecc <_ChromeMain+0x4611c30>
 4616c2c: f9429e60     	ldr	x0, [x19, #0x538]
 4616c30: f940cc02     	ldr	x2, [x0, #0x198]
 4616c34: aa1503e1     	mov	x1, x21
 4616c38: 970589f1     	bl	0x7793fc <_ChromeMain+0x774160>
 4616c3c: 17fffc79     	b	0x4615e20 <_ChromeMain+0x4610b84>
 4616c40: 390edadf     	strb	wzr, [x22, #0x3b6]
 4616c44: aa1603e0     	mov	x0, x22
 4616c48: 972445b0     	bl	0xf28308 <_ChromeMain+0xf2306c>
 4616c4c: aa1603e0     	mov	x0, x22
 4616c50: 52800041     	mov	w1, #0x2                ; =2
 4616c54: 97072b44     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4616c58: 9103e2c0     	add	x0, x22, #0xf8
 4616c5c: 910edac1     	add	x1, x22, #0x3b6
 4616c60: 972444dc     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4616c64: f9418ab6     	ldr	x22, [x21, #0x310]
 4616c68: 17ffffd7     	b	0x4616bc4 <_ChromeMain+0x4611928>
 4616c6c: f9000be0     	str	x0, [sp, #0x10]
 4616c70: f942a260     	ldr	x0, [x19, #0x540]
 4616c74: 91002122     	add	x2, x9, #0x8
 4616c78: d2800003     	mov	x3, #0x0                ; =0
 4616c7c: aa1003f7     	mov	x23, x16
 4616c80: aa1103fc     	mov	x28, x17
 4616c84: 95811908     	bl	0xa65d0a4 <_ChromeMain+0xa657e08>
 4616c88: f9400be0     	ldr	x0, [sp, #0x10]
 4616c8c: aa1c03f1     	mov	x17, x28
 4616c90: aa1703f0     	mov	x16, x23
 4616c94: 91004294     	add	x20, x20, #0x10
 4616c98: 52800028     	mov	w8, #0x1                ; =1
 4616c9c: eb15029f     	cmp	x20, x21
 4616ca0: 54ffbd61     	b.ne	0x461644c <_ChromeMain+0x46111b0>
 4616ca4: 17ffff04     	b	0x46168b4 <_ChromeMain+0x4611618>
 4616ca8: 3915627f     	strb	wzr, [x19, #0x558]
 4616cac: f942b660     	ldr	x0, [x19, #0x568]
 4616cb0: 91152261     	add	x1, x19, #0x548
 4616cb4: 976bca93     	bl	0x2109700 <_ChromeMain+0x2104464>
 4616cb8: f942a668     	ldr	x8, [x19, #0x548]
 4616cbc: f9401d08     	ldr	x8, [x8, #0x38]
 4616cc0: 91152260     	add	x0, x19, #0x548
 4616cc4: d63f0100     	blr	x8
 4616cc8: f942b268     	ldr	x8, [x19, #0x560]
 4616ccc: b4ffb528     	cbz	x8, 0x4616370 <_ChromeMain+0x46110d4>
 4616cd0: f942a668     	ldr	x8, [x19, #0x548]
 4616cd4: f9402108     	ldr	x8, [x8, #0x40]
 4616cd8: 91152260     	add	x0, x19, #0x548
 4616cdc: d63f0100     	blr	x8
 4616ce0: f942b268     	ldr	x8, [x19, #0x560]
 4616ce4: f9400109     	ldr	x9, [x8]
 4616ce8: 7100001f     	cmp	w0, #0x0
 4616cec: 5280020a     	mov	w10, #0x10              ; =16
 4616cf0: 5280040b     	mov	w11, #0x20              ; =32
 4616cf4: 9a8a116a     	csel	x10, x11, x10, ne
 4616cf8: f86a6929     	ldr	x9, [x9, x10]
 4616cfc: 91152261     	add	x1, x19, #0x548
 4616d00: aa0803e0     	mov	x0, x8
 4616d04: d63f0120     	blr	x9
 4616d08: 17fffd9a     	b	0x4616370 <_ChromeMain+0x46110d4>
 4616d0c: 3916827f     	strb	wzr, [x19, #0x5a0]
 4616d10: 17fffd95     	b	0x4616364 <_ChromeMain+0x46110c8>
 4616d14: 9763f41b     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4616d18: 9417bcc2     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4616d1c: f9405aa8     	ldr	x8, [x21, #0xb0]
 4616d20: f9402500     	ldr	x0, [x8, #0x48]
 4616d24: 95270fc8     	bl	0x8fdac44 <_ChromeMain+0x8fd59a8>
 4616d28: f94062a8     	ldr	x8, [x21, #0xc0]
 4616d2c: b5ffff88     	cbnz	x8, 0x4616d1c <_ChromeMain+0x4611a80>
 4616d30: f94056a1     	ldr	x1, [x21, #0xa8]
 4616d34: aa1503e0     	mov	x0, x21
 4616d38: 95811b5c     	bl	0xa65daa8 <_ChromeMain+0xa65880c>
 4616d3c: 17fffbcf     	b	0x4615c78 <_ChromeMain+0x46109dc>
 4616d40: d4200000     	brk	#0
 4616d44: d4400000     	hlt	#0
 4616d48: d4200020     	brk	#0x1
 4616d4c: d4200000     	brk	#0
 4616d50: d4400000     	hlt	#0
 4616d54: d4200020     	brk	#0x1
 4616d58: d4200000     	brk	#0
 4616d5c: d4400000     	hlt	#0
 4616d60: d4200020     	brk	#0x1
 4616d64: f9400a88     	ldr	x8, [x20, #0x10]
 4616d68: aa1403e0     	mov	x0, x20
 4616d6c: d63f0100     	blr	x8
 4616d70: 17fffc4d     	b	0x4615ea4 <_ChromeMain+0x4610c08>
 4616d74: d4200000     	brk	#0
 4616d78: d4400000     	hlt	#0
 4616d7c: d4200020     	brk	#0x1
 4616d80: d4200000     	brk	#0
 4616d84: d4400000     	hlt	#0
 4616d88: d4200020     	brk	#0x1
 4616d8c: d4200000     	brk	#0
 4616d90: d4400000     	hlt	#0
 4616d94: d4200020     	brk	#0x1
 4616d98: d4200000     	brk	#0
 4616d9c: d4400000     	hlt	#0
 4616da0: d4200020     	brk	#0x1
 4616da4: b00530a0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4616da8: 910a2000     	add	x0, x0, #0x288
 4616dac: 96ec0935     	bl	0x119280 <_ChromeMain+0x113fe4>
 4616db0: 36000940     	tbz	w0, #0x0, 0x4616ed8 <_ChromeMain+0x4611c3c>
 4616db4: f9402aa8     	ldr	x8, [x21, #0x50]
 4616db8: f9001be8     	str	x8, [sp, #0x30]
 4616dbc: b4ff81c8     	cbz	x8, 0x4615df4 <_ChromeMain+0x4610b58>
 4616dc0: d101e3a0     	sub	x0, x29, #0x78
 4616dc4: d101e3a1     	sub	x1, x29, #0x78
 4616dc8: 9100c3e2     	add	x2, sp, #0x30
 4616dcc: 949a4e85     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4616dd0: 36078121     	tbz	w1, #0x0, 0x4615df4 <_ChromeMain+0x4610b58>
 4616dd4: f9401be1     	ldr	x1, [sp, #0x30]
 4616dd8: 7100031f     	cmp	w24, #0x0
 4616ddc: 910183e8     	add	x8, sp, #0x60
 4616de0: 9a9f1104     	csel	x4, x8, xzr, ne
 4616de4: 910123e3     	add	x3, sp, #0x48
 4616de8: aa1303e0     	mov	x0, x19
 4616dec: 52800002     	mov	w2, #0x0                ; =0
 4616df0: 94000140     	bl	0x46172f0 <_ChromeMain+0x4612054>
 4616df4: 17fffc00     	b	0x4615df4 <_ChromeMain+0x4610b58>
 4616df8: b00530a0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4616dfc: 910a2000     	add	x0, x0, #0x288
 4616e00: 96ec0920     	bl	0x119280 <_ChromeMain+0x113fe4>
 4616e04: 36000700     	tbz	w0, #0x0, 0x4616ee4 <_ChromeMain+0x4611c48>
 4616e08: f9402ea8     	ldr	x8, [x21, #0x58]
 4616e0c: f9001be8     	str	x8, [sp, #0x30]
 4616e10: b4ff7f68     	cbz	x8, 0x4615dfc <_ChromeMain+0x4610b60>
 4616e14: d101e3a0     	sub	x0, x29, #0x78
 4616e18: d101e3a1     	sub	x1, x29, #0x78
 4616e1c: 9100c3e2     	add	x2, sp, #0x30
 4616e20: 949a4e70     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4616e24: 36077ec1     	tbz	w1, #0x0, 0x4615dfc <_ChromeMain+0x4610b60>
 4616e28: f9401be1     	ldr	x1, [sp, #0x30]
 4616e2c: 7100031f     	cmp	w24, #0x0
 4616e30: 910183e8     	add	x8, sp, #0x60
 4616e34: 9a9f1104     	csel	x4, x8, xzr, ne
 4616e38: 910123e3     	add	x3, sp, #0x48
 4616e3c: aa1303e0     	mov	x0, x19
 4616e40: 52800002     	mov	w2, #0x0                ; =0
 4616e44: 9400012b     	bl	0x46172f0 <_ChromeMain+0x4612054>
 4616e48: 17fffbed     	b	0x4615dfc <_ChromeMain+0x4610b60>
 4616e4c: b00530a0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4616e50: 910a2000     	add	x0, x0, #0x288
 4616e54: 96ec090b     	bl	0x119280 <_ChromeMain+0x113fe4>
 4616e58: 360004c0     	tbz	w0, #0x0, 0x4616ef0 <_ChromeMain+0x4611c54>
 4616e5c: f94032a8     	ldr	x8, [x21, #0x60]
 4616e60: f9001be8     	str	x8, [sp, #0x30]
 4616e64: b4ff7d08     	cbz	x8, 0x4615e04 <_ChromeMain+0x4610b68>
 4616e68: d101e3a0     	sub	x0, x29, #0x78
 4616e6c: d101e3a1     	sub	x1, x29, #0x78
 4616e70: 9100c3e2     	add	x2, sp, #0x30
 4616e74: 949a4e5b     	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4616e78: 36077c61     	tbz	w1, #0x0, 0x4615e04 <_ChromeMain+0x4610b68>
 4616e7c: f9401be1     	ldr	x1, [sp, #0x30]
 4616e80: 7100031f     	cmp	w24, #0x0
 4616e84: 910183e8     	add	x8, sp, #0x60
 4616e88: 9a9f1104     	csel	x4, x8, xzr, ne
 4616e8c: 910123e3     	add	x3, sp, #0x48
 4616e90: aa1303e0     	mov	x0, x19
 4616e94: 52800002     	mov	w2, #0x0                ; =0
 4616e98: 94000116     	bl	0x46172f0 <_ChromeMain+0x4612054>
 4616e9c: 17fffbda     	b	0x4615e04 <_ChromeMain+0x4610b68>
 4616ea0: f9400ac8     	ldr	x8, [x22, #0x10]
 4616ea4: aa1603e0     	mov	x0, x22
 4616ea8: d63f0100     	blr	x8
 4616eac: 17fffcc6     	b	0x46161c4 <_ChromeMain+0x4610f28>
 4616eb0: 97f2f212     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4616eb4: 17fffef6     	b	0x4616a8c <_ChromeMain+0x46117f0>
 4616eb8: 97f2f210     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4616ebc: 17ffff0b     	b	0x4616ae8 <_ChromeMain+0x461184c>
 4616ec0: d4200000     	brk	#0
 4616ec4: d4400000     	hlt	#0
 4616ec8: d4200020     	brk	#0x1
 4616ecc: d4200000     	brk	#0
 4616ed0: d4400000     	hlt	#0
 4616ed4: d4200020     	brk	#0x1
 4616ed8: d4200000     	brk	#0
 4616edc: d4400000     	hlt	#0
 4616ee0: d4200020     	brk	#0x1
 4616ee4: d4200000     	brk	#0
 4616ee8: d4400000     	hlt	#0
 4616eec: d4200020     	brk	#0x1
 4616ef0: d4200000     	brk	#0
 4616ef4: d4400000     	hlt	#0
 4616ef8: d4200020     	brk	#0x1
