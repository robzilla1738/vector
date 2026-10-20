
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3417c64: d101c3ff     	sub	sp, sp, #0x70
 3417c68: a9016ffc     	stp	x28, x27, [sp, #0x10]
 3417c6c: a90267fa     	stp	x26, x25, [sp, #0x20]
 3417c70: a9035ff8     	stp	x24, x23, [sp, #0x30]
 3417c74: a90457f6     	stp	x22, x21, [sp, #0x40]
 3417c78: a9054ff4     	stp	x20, x19, [sp, #0x50]
 3417c7c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 3417c80: 910183fd     	add	x29, sp, #0x60
 3417c84: aa0703f5     	mov	x21, x7
 3417c88: aa0603f6     	mov	x22, x6
 3417c8c: aa0503f7     	mov	x23, x5
 3417c90: aa0403f8     	mov	x24, x4
 3417c94: aa0303f9     	mov	x25, x3
 3417c98: aa0203fa     	mov	x26, x2
 3417c9c: aa0103f4     	mov	x20, x1
 3417ca0: aa0003f3     	mov	x19, x0
 3417ca4: 90057508     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 3417ca8: 913c2108     	add	x8, x8, #0xf08
 3417cac: f9000008     	str	x8, [x0]
 3417cb0: 52800100     	mov	w0, #0x8                ; =8
 3417cb4: 972fddad     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417cb8: b900001f     	str	wzr, [x0]
 3417cbc: 3900101f     	strb	wzr, [x0, #0x4]
 3417cc0: b40000c0     	cbz	x0, 0x3417cd8 <_ChromeMain+0x3412a3c>
 3417cc4: 52800028     	mov	w8, #0x1                ; =1
 3417cc8: b8280008     	ldadd	w8, w8, [x0]
 3417ccc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3417cd0: 6b09011f     	cmp	w8, w9
 3417cd4: 54001a40     	b.eq	0x341801c <_ChromeMain+0x3412d80>
 3417cd8: f9400fbc     	ldr	x28, [x29, #0x18]
 3417cdc: a900ce60     	stp	x0, x19, [x19, #0x8]
 3417ce0: b0056ea8     	adrp	x8, 0xe1ec000 <dyld_stub_binder+0xe1ec000>
 3417ce4: 91220108     	add	x8, x8, #0x880
 3417ce8: f9000268     	str	x8, [x19]
 3417cec: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3417cf0: f005bcc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3417cf4: f9404529     	ldr	x9, [x9, #0x88]
 3417cf8: eb09011f     	cmp	x8, x9
 3417cfc: 54000061     	b.ne	0x3417d08 <_ChromeMain+0x3412a6c>
 3417d00: aa1403e0     	mov	x0, x20
 3417d04: 972ff17e     	bl	0x142fc <_ChromeMain+0xf060>
 3417d08: 394043bb     	ldrb	w27, [x29, #0x10]
 3417d0c: f9000e74     	str	x20, [x19, #0x18]
 3417d10: 925e7748     	and	x8, x26, #0xfffffffc00000000
 3417d14: f005bcc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3417d18: f9404529     	ldr	x9, [x9, #0x88]
 3417d1c: eb09011f     	cmp	x8, x9
 3417d20: 54001780     	b.eq	0x3418010 <_ChromeMain+0x3412d74>
 3417d24: f900127a     	str	x26, [x19, #0x20]
 3417d28: 3900a279     	strb	w25, [x19, #0x28]
 3417d2c: f9001a7f     	str	xzr, [x19, #0x30]
 3417d30: 3900e278     	strb	w24, [x19, #0x38]
 3417d34: 3900e677     	strb	w23, [x19, #0x39]
 3417d38: 3900ea7b     	strb	w27, [x19, #0x3a]
 3417d3c: 3900ee76     	strb	w22, [x19, #0x3b]
 3417d40: 3900f275     	strb	w21, [x19, #0x3c]
 3417d44: f803d27f     	stur	xzr, [x19, #0x3d]
 3417d48: f804d27f     	stur	xzr, [x19, #0x4d]
 3417d4c: f804527f     	stur	xzr, [x19, #0x45]
 3417d50: b900567f     	str	wzr, [x19, #0x54]
 3417d54: f9400797     	ldr	x23, [x28, #0x8]
 3417d58: b4000377     	cbz	x23, 0x3417dc4 <_ChromeMain+0x3412b28>
 3417d5c: d379fee8     	lsr	x8, x23, #57
 3417d60: b50013c8     	cbnz	x8, 0x3417fd8 <_ChromeMain+0x3412d3c>
 3417d64: f9400395     	ldr	x21, [x28]
 3417d68: d379e2f6     	lsl	x22, x23, #7
 3417d6c: aa1603e0     	mov	x0, x22
 3417d70: 972fdd7e     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417d74: a9047e60     	stp	x0, xzr, [x19, #0x40]
 3417d78: f9002a77     	str	x23, [x19, #0x50]
 3417d7c: cb0003f7     	neg	x23, x0
 3417d80: b4001160     	cbz	x0, 0x3417fac <_ChromeMain+0x3412d10>
 3417d84: aa1503e1     	mov	x1, x21
 3417d88: 97348883     	bl	0x139f94 <_ChromeMain+0x134cf8>
 3417d8c: b9407aa8     	ldr	w8, [x21, #0x78]
 3417d90: 3941f2a9     	ldrb	w9, [x21, #0x7c]
 3417d94: 3901f009     	strb	w9, [x0, #0x7c]
 3417d98: b9007808     	str	w8, [x0, #0x78]
 3417d9c: 910202b5     	add	x21, x21, #0x80
 3417da0: 91020000     	add	x0, x0, #0x80
 3417da4: d10202f7     	sub	x23, x23, #0x80
 3417da8: d10202d6     	sub	x22, x22, #0x80
 3417dac: b5fffeb6     	cbnz	x22, 0x3417d80 <_ChromeMain+0x3412ae4>
 3417db0: f9402268     	ldr	x8, [x19, #0x40]
 3417db4: cb1703e9     	neg	x9, x23
 3417db8: cb080128     	sub	x8, x9, x8
 3417dbc: 9347fd08     	asr	x8, x8, #7
 3417dc0: f9002668     	str	x8, [x19, #0x48]
 3417dc4: a905fe7f     	stp	xzr, xzr, [x19, #0x58]
 3417dc8: f900367f     	str	xzr, [x19, #0x68]
 3417dcc: 12800008     	mov	w8, #-0x1               ; =-1
 3417dd0: b9007268     	str	w8, [x19, #0x70]
 3417dd4: aa1303f6     	mov	x22, x19
 3417dd8: f8078edf     	str	xzr, [x22, #0x78]!
 3417ddc: f900427f     	str	xzr, [x19, #0x80]
 3417de0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 3417de4: f005bcc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3417de8: f9404529     	ldr	x9, [x9, #0x88]
 3417dec: eb09011f     	cmp	x8, x9
 3417df0: 54000061     	b.ne	0x3417dfc <_ChromeMain+0x3412b60>
 3417df4: aa1303e0     	mov	x0, x19
 3417df8: 972ff141     	bl	0x142fc <_ChromeMain+0xf060>
 3417dfc: a908fe73     	stp	x19, xzr, [x19, #0x88]
 3417e00: d005bcc8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 3417e04: f9468d08     	ldr	x8, [x8, #0xd18]
 3417e08: d63f0100     	blr	x8
 3417e0c: f9004e60     	str	x0, [x19, #0x98]
 3417e10: 3902827f     	strb	wzr, [x19, #0xa0]
 3417e14: 52800100     	mov	w0, #0x8                ; =8
 3417e18: 972fdd54     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417e1c: b900001f     	str	wzr, [x0]
 3417e20: 3900101f     	strb	wzr, [x0, #0x4]
 3417e24: b40000c0     	cbz	x0, 0x3417e3c <_ChromeMain+0x3412ba0>
 3417e28: 52800028     	mov	w8, #0x1                ; =1
 3417e2c: b8280008     	ldadd	w8, w8, [x0]
 3417e30: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3417e34: 6b09011f     	cmp	w8, w9
 3417e38: 54000f80     	b.eq	0x3418028 <_ChromeMain+0x3412d8c>
 3417e3c: a90ace60     	stp	x0, x19, [x19, #0xa8]
 3417e40: 9005c968     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3417e44: 91194108     	add	x8, x8, #0x650
 3417e48: 38bfc108     	ldaprb	w8, [x8]
 3417e4c: 37000348     	tbnz	w8, #0x0, 0x3417eb4 <_ChromeMain+0x3412c18>
 3417e50: 9005c975     	adrp	x21, 0xed43000 <dyld_stub_binder+0xed43000>
 3417e54: 911942b5     	add	x21, x21, #0x650
 3417e58: aa1503e0     	mov	x0, x21
 3417e5c: 952fb299     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 3417e60: 340002a0     	cbz	w0, 0x3417eb4 <_ChromeMain+0x3412c18>
 3417e64: 9005c968     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3417e68: 9118e108     	add	x8, x8, #0x638
 3417e6c: f900091f     	str	xzr, [x8, #0x10]
 3417e70: aa0803e9     	mov	x9, x8
 3417e74: f8008d3f     	str	xzr, [x9, #0x8]!
 3417e78: f9000109     	str	x9, [x8]
 3417e7c: 52800037     	mov	w23, #0x1               ; =1
 3417e80: 089ffeb7     	stlrb	w23, [x21]
 3417e84: 9005c6a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3417e88: 9127c000     	add	x0, x0, #0x9f0
 3417e8c: 952fb290     	bl	0x80048cc <_ChromeMain+0x7fff630>
 3417e90: 35000f20     	cbnz	w0, 0x3418074 <_ChromeMain+0x3412dd8>
 3417e94: 9005c968     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3417e98: 39594515     	ldrb	w21, [x8, #0x651]
 3417e9c: 39194517     	strb	w23, [x8, #0x651]
 3417ea0: 9005c6a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3417ea4: 9127c000     	add	x0, x0, #0x9f0
 3417ea8: 952fb297     	bl	0x8004904 <_ChromeMain+0x7fff668>
 3417eac: 35000d40     	cbnz	w0, 0x3418054 <_ChromeMain+0x3412db8>
 3417eb0: 37100815     	tbnz	w21, #0x2, 0x3417fb0 <_ChromeMain+0x3412d14>
 3417eb4: 9005c975     	adrp	x21, 0xed43000 <dyld_stub_binder+0xed43000>
 3417eb8: 911902b5     	add	x21, x21, #0x640
 3417ebc: f94002a8     	ldr	x8, [x21]
 3417ec0: aa1503f8     	mov	x24, x21
 3417ec4: aa1503f7     	mov	x23, x21
 3417ec8: b5000908     	cbnz	x8, 0x3417fe8 <_ChromeMain+0x3412d4c>
 3417ecc: 52800500     	mov	w0, #0x28               ; =40
 3417ed0: 972fdd26     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417ed4: b40006c0     	cbz	x0, 0x3417fac <_ChromeMain+0x3412d10>
 3417ed8: aa0003e1     	mov	x1, x0
 3417edc: b100801f     	cmn	x0, #0x20
 3417ee0: 54000660     	b.eq	0x3417fac <_ChromeMain+0x3412d10>
 3417ee4: f9001033     	str	x19, [x1, #0x20]
 3417ee8: a9007c3f     	stp	xzr, xzr, [x1]
 3417eec: f9000837     	str	x23, [x1, #0x10]
 3417ef0: f9000301     	str	x1, [x24]
 3417ef4: 9005c968     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3417ef8: f9431d09     	ldr	x9, [x8, #0x638]
 3417efc: f9400129     	ldr	x9, [x9]
 3417f00: b4000069     	cbz	x9, 0x3417f0c <_ChromeMain+0x3412c70>
 3417f04: f9031d09     	str	x9, [x8, #0x638]
 3417f08: f9400301     	ldr	x1, [x24]
 3417f0c: f94002a0     	ldr	x0, [x21]
 3417f10: 97310ed4     	bl	0x5ba60 <_ChromeMain+0x567c4>
 3417f14: f94006a8     	ldr	x8, [x21, #0x8]
 3417f18: 91000508     	add	x8, x8, #0x1
 3417f1c: f90006a8     	str	x8, [x21, #0x8]
 3417f20: 52800100     	mov	w0, #0x8                ; =8
 3417f24: 972fdd11     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417f28: aa0003f5     	mov	x21, x0
 3417f2c: 52800088     	mov	w8, #0x4                ; =4
 3417f30: f9000008     	str	x8, [x0]
 3417f34: 97d05553     	bl	0x282d480 <_ChromeMain+0x28281e4>
 3417f38: 52800081     	mov	w1, #0x4                ; =4
 3417f3c: 52800002     	mov	w2, #0x0                ; =0
 3417f40: 97d05590     	bl	0x282d580 <_ChromeMain+0x28282e4>
 3417f44: f94002c0     	ldr	x0, [x22]
 3417f48: f90002d5     	str	x21, [x22]
 3417f4c: b5000740     	cbnz	x0, 0x3418034 <_ChromeMain+0x3412d98>
 3417f50: 52800300     	mov	w0, #0x18               ; =24
 3417f54: 972fdd05     	bl	0xf368 <_ChromeMain+0xa0cc>
 3417f58: aa0003f5     	mov	x21, x0
 3417f5c: aa1403e0     	mov	x0, x20
 3417f60: 97f05fe8     	bl	0x302ff00 <_ChromeMain+0x302ac64>
 3417f64: a90006a0     	stp	x0, x1, [x21]
 3417f68: 52800028     	mov	w8, #0x1                ; =1
 3417f6c: b90012a8     	str	w8, [x21, #0x10]
 3417f70: aa1403e0     	mov	x0, x20
 3417f74: 52800021     	mov	w1, #0x1                ; =1
 3417f78: 97d481bf     	bl	0x2938674 <_ChromeMain+0x29333d8>
 3417f7c: f9404260     	ldr	x0, [x19, #0x80]
 3417f80: f9004275     	str	x21, [x19, #0x80]
 3417f84: b5000600     	cbnz	x0, 0x3418044 <_ChromeMain+0x3412da8>
 3417f88: aa1303e0     	mov	x0, x19
 3417f8c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 3417f90: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 3417f94: a94457f6     	ldp	x22, x21, [sp, #0x40]
 3417f98: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 3417f9c: a94267fa     	ldp	x26, x25, [sp, #0x20]
 3417fa0: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 3417fa4: 9101c3ff     	add	sp, sp, #0x70
 3417fa8: d65f03c0     	ret
 3417fac: d4200020     	brk	#0x1
 3417fb0: 9005c6a0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3417fb4: 9128c000     	add	x0, x0, #0xa30
 3417fb8: 952fb256     	bl	0x8004910 <_ChromeMain+0x7fff674>
 3417fbc: 34fff7c0     	cbz	w0, 0x3417eb4 <_ChromeMain+0x3412c18>
 3417fc0: b00556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3417fc4: 911c4d08     	add	x8, x8, #0x713
 3417fc8: f90003e8     	str	x8, [sp]
 3417fcc: b00556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3417fd0: 911c9c00     	add	x0, x0, #0x727
 3417fd4: 952fb252     	bl	0x800491c <_ChromeMain+0x7fff680>
 3417fd8: 945e980a     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 3417fdc: f94002e8     	ldr	x8, [x23]
 3417fe0: aa1703f8     	mov	x24, x23
 3417fe4: b4fff748     	cbz	x8, 0x3417ecc <_ChromeMain+0x3412c30>
 3417fe8: aa0803f7     	mov	x23, x8
 3417fec: f9401108     	ldr	x8, [x8, #0x20]
 3417ff0: eb08027f     	cmp	x19, x8
 3417ff4: 54ffff43     	b.lo	0x3417fdc <_ChromeMain+0x3412d40>
 3417ff8: eb13011f     	cmp	x8, x19
 3417ffc: 54fff922     	b.hs	0x3417f20 <_ChromeMain+0x3412c84>
 3418000: f94006e8     	ldr	x8, [x23, #0x8]
 3418004: b5ffff28     	cbnz	x8, 0x3417fe8 <_ChromeMain+0x3412d4c>
 3418008: 910022f8     	add	x24, x23, #0x8
 341800c: 17ffffb0     	b	0x3417ecc <_ChromeMain+0x3412c30>
 3418010: aa1a03e0     	mov	x0, x26
 3418014: 972ff0ba     	bl	0x142fc <_ChromeMain+0xf060>
 3418018: 17ffff43     	b	0x3417d24 <_ChromeMain+0x3412a88>
 341801c: d4200000     	brk	#0
 3418020: d4400000     	hlt	#0
 3418024: d4200020     	brk	#0x1
 3418028: d4200000     	brk	#0
 341802c: d4400000     	hlt	#0
 3418030: d4200020     	brk	#0x1
 3418034: 97d5a65d     	bl	0x29819a8 <_ChromeMain+0x297c70c>
 3418038: 52800101     	mov	w1, #0x8                ; =8
 341803c: 972fc39f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418040: 17ffffc4     	b	0x3417f50 <_ChromeMain+0x3412cb4>
 3418044: 97c471e1     	bl	0x25347c8 <_ChromeMain+0x252f52c>
 3418048: 52800301     	mov	w1, #0x18               ; =24
 341804c: 972fc39b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418050: 17ffffce     	b	0x3417f88 <_ChromeMain+0x3412cec>
 3418054: 900556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418058: 911c4d08     	add	x8, x8, #0x713
 341805c: f90003e8     	str	x8, [sp]
 3418060: 900556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418064: 911be000     	add	x0, x0, #0x6f8
 3418068: 952fb22d     	bl	0x800491c <_ChromeMain+0x7fff680>
 341806c: 17ffffd0     	b	0x3417fac <_ChromeMain+0x3412d10>
 3418070: 952fb295     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 3418074: 900556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418078: 911c4d08     	add	x8, x8, #0x713
 341807c: f90003e8     	str	x8, [sp]
 3418080: 900556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418084: 911b7400     	add	x0, x0, #0x6dd
 3418088: 952fb225     	bl	0x800491c <_ChromeMain+0x7fff680>
 341808c: d10243ff     	sub	sp, sp, #0x90
 3418090: a9055ff8     	stp	x24, x23, [sp, #0x50]
 3418094: a90657f6     	stp	x22, x21, [sp, #0x60]
 3418098: a9074ff4     	stp	x20, x19, [sp, #0x70]
 341809c: a9087bfd     	stp	x29, x30, [sp, #0x80]
 34180a0: 910203fd     	add	x29, sp, #0x80
 34180a4: aa0003f3     	mov	x19, x0
 34180a8: 3940f008     	ldrb	w8, [x0, #0x3c]
 34180ac: 340004c8     	cbz	w8, 0x3418144 <_ChromeMain+0x3412ea8>
 34180b0: f9400e75     	ldr	x21, [x19, #0x18]
 34180b4: 9771d447     	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 34180b8: aa1503e1     	mov	x1, x21
 34180bc: 52800022     	mov	w2, #0x1                ; =1
 34180c0: 9730eb35     	bl	0x52d94 <_ChromeMain+0x4daf8>
 34180c4: d1004014     	sub	x20, x0, #0x10
 34180c8: f100001f     	cmp	x0, #0x0
 34180cc: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 34180d0: 54001760     	b.eq	0x34183bc <_ChromeMain+0x3413120>
 34180d4: f9405675     	ldr	x21, [x19, #0xa8]
 34180d8: b40000d5     	cbz	x21, 0x34180f0 <_ChromeMain+0x3412e54>
 34180dc: 52800028     	mov	w8, #0x1                ; =1
 34180e0: b82802a8     	ldadd	w8, w8, [x21]
 34180e4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 34180e8: 6b09011f     	cmp	w8, w9
 34180ec: 540014c0     	b.eq	0x3418384 <_ChromeMain+0x34130e8>
 34180f0: f9405a76     	ldr	x22, [x19, #0xb0]
 34180f4: 52800900     	mov	w0, #0x48               ; =72
 34180f8: 972fdc9c     	bl	0xf368 <_ChromeMain+0xa0cc>
 34180fc: aa0003e1     	mov	x1, x0
 3418100: 52800028     	mov	w8, #0x1                ; =1
 3418104: b9000008     	str	w8, [x0]
 3418108: b0ffec28     	adrp	x8, 0x319d000 <_ChromeMain+0x3197d64>
 341810c: 913e8108     	add	x8, x8, #0xfa0
 3418110: f0002569     	adrp	x9, 0x38c7000 <_ChromeMain+0x38c1d64>
 3418114: 91240129     	add	x9, x9, #0x900
 3418118: a900a408     	stp	x8, x9, [x0, #0x8]
 341811c: f000d008     	adrp	x8, 0x4e1b000 <_ChromeMain+0x4e15d64>
 3418120: 91370108     	add	x8, x8, #0xdc0
 3418124: d0ffec29     	adrp	x9, 0x319e000 <_ChromeMain+0x3198d64>
 3418128: 9103c129     	add	x9, x9, #0xf0
 341812c: a901a408     	stp	x8, x9, [x0, #0x18]
 3418130: a902d41f     	stp	xzr, x21, [x0, #0x28]
 3418134: f9001c16     	str	x22, [x0, #0x38]
 3418138: 3901001f     	strb	wzr, [x0, #0x40]
 341813c: aa1403e0     	mov	x0, x20
 3418140: 94000107     	bl	0x341855c <_ChromeMain+0x34132c0>
 3418144: 3940ee68     	ldrb	w8, [x19, #0x3b]
 3418148: 35001548     	cbnz	w8, 0x34183f0 <_ChromeMain+0x3413154>
 341814c: 3940a268     	ldrb	w8, [x19, #0x28]
 3418150: 34001248     	cbz	w8, 0x3418398 <_ChromeMain+0x34130fc>
 3418154: f90023ff     	str	xzr, [sp, #0x40]
 3418158: 6f00e400     	movi.2d	v0, #0000000000000000
 341815c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 3418160: 910083e0     	add	x0, sp, #0x20
 3418164: 52800021     	mov	w1, #0x1                ; =1
 3418168: 97a76c23     	bl	0x1df31f4 <_ChromeMain+0x1dedf58>
 341816c: 910083e0     	add	x0, sp, #0x20
 3418170: 97cbfc66     	bl	0x2717308 <_ChromeMain+0x271206c>
 3418174: f9401a74     	ldr	x20, [x19, #0x30]
 3418178: f9001a60     	str	x0, [x19, #0x30]
 341817c: b5000b74     	cbnz	x20, 0x34182e8 <_ChromeMain+0x341304c>
 3418180: d0053540     	adrp	x0, 0xdac2000 <dyld_stub_binder+0xdac2000>
 3418184: 91307400     	add	x0, x0, #0xc1d
 3418188: d0053541     	adrp	x1, 0xdac2000 <dyld_stub_binder+0xdac2000>
 341818c: 91309421     	add	x1, x1, #0xc25
 3418190: 910003e8     	mov	x8, sp
 3418194: 52803202     	mov	w2, #0x190              ; =400
 3418198: 9730e2ba     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 341819c: 910083e0     	add	x0, sp, #0x20
 34181a0: 910003e1     	mov	x1, sp
 34181a4: 97a76df5     	bl	0x1df3978 <_ChromeMain+0x1dee6dc>
 34181a8: f9401a74     	ldr	x20, [x19, #0x30]
 34181ac: f9001a7f     	str	xzr, [x19, #0x30]
 34181b0: b50006d4     	cbnz	x20, 0x3418288 <_ChromeMain+0x3412fec>
 34181b4: f90023ff     	str	xzr, [sp, #0x40]
 34181b8: f9401fe8     	ldr	x8, [sp, #0x38]
 34181bc: b4000168     	cbz	x8, 0x34181e8 <_ChromeMain+0x3412f4c>
 34181c0: 52800029     	mov	w9, #0x1                ; =1
 34181c4: 19004109     	stlurb	w9, [x8, #0x4]
 34181c8: f9401fe0     	ldr	x0, [sp, #0x38]
 34181cc: b40000e0     	cbz	x0, 0x34181e8 <_ChromeMain+0x3412f4c>
 34181d0: 12800008     	mov	w8, #-0x1               ; =-1
 34181d4: b8e80008     	ldaddal	w8, w8, [x0]
 34181d8: 7100051f     	cmp	w8, #0x1
 34181dc: 54000061     	b.ne	0x34181e8 <_ChromeMain+0x3412f4c>
 34181e0: 52800101     	mov	w1, #0x8                ; =8
 34181e4: 972fc335     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34181e8: f9401be0     	ldr	x0, [sp, #0x30]
 34181ec: b40000c0     	cbz	x0, 0x3418204 <_ChromeMain+0x3412f68>
 34181f0: 91002008     	add	x8, x0, #0x8
 34181f4: 12800009     	mov	w9, #-0x1               ; =-1
 34181f8: b8e90108     	ldaddal	w9, w8, [x8]
 34181fc: 7100051f     	cmp	w8, #0x1
 3418200: 54000320     	b.eq	0x3418264 <_ChromeMain+0x3412fc8>
 3418204: f94013e0     	ldr	x0, [sp, #0x20]
 3418208: 925e7408     	and	x8, x0, #0xfffffffc00000000
 341820c: d005bcc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3418210: f9404529     	ldr	x9, [x9, #0x88]
 3418214: eb09011f     	cmp	x8, x9
 3418218: 54000041     	b.ne	0x3418220 <_ChromeMain+0x3412f84>
 341821c: 97303a0a     	bl	0x26a44 <_ChromeMain+0x217a8>
 3418220: b9407262     	ldr	w2, [x19, #0x70]
 3418224: 91016261     	add	x1, x19, #0x58
 3418228: aa1303e0     	mov	x0, x19
 341822c: 97dc00f5     	bl	0x2b18600 <_ChromeMain+0x2b13364>
 3418230: aa0003f4     	mov	x20, x0
 3418234: b40000b3     	cbz	x19, 0x3418248 <_ChromeMain+0x3412fac>
 3418238: aa1303e0     	mov	x0, x19
 341823c: 940000ef     	bl	0x34185f8 <_ChromeMain+0x341335c>
 3418240: 52801701     	mov	w1, #0xb8               ; =184
 3418244: 972fc31d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418248: aa1403e0     	mov	x0, x20
 341824c: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 3418250: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 3418254: a94657f6     	ldp	x22, x21, [sp, #0x60]
 3418258: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 341825c: 910243ff     	add	sp, sp, #0x90
 3418260: d65f03c0     	ret
 3418264: f9400009     	ldr	x9, [x0]
 3418268: f9400d28     	ldr	x8, [x9, #0x18]
 341826c: d000758a     	adrp	x10, 0x42ca000 <_ChromeMain+0x42c4d64>
 3418270: 912a314a     	add	x10, x10, #0xa8c
 3418274: eb0a011f     	cmp	x8, x10
 3418278: 54000041     	b.ne	0x3418280 <_ChromeMain+0x3412fe4>
 341827c: f9400928     	ldr	x8, [x9, #0x10]
 3418280: d63f0100     	blr	x8
 3418284: 17ffffe0     	b	0x3418204 <_ChromeMain+0x3412f68>
 3418288: 12800008     	mov	w8, #-0x1               ; =-1
 341828c: b8e80288     	ldaddal	w8, w8, [x20]
 3418290: 7100051f     	cmp	w8, #0x1
 3418294: 54fff901     	b.ne	0x34181b4 <_ChromeMain+0x3412f18>
 3418298: f9400a88     	ldr	x8, [x20, #0x10]
 341829c: b0fedc69     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 34182a0: 91190129     	add	x9, x9, #0x640
 34182a4: eb09011f     	cmp	x8, x9
 34182a8: 54000100     	b.eq	0x34182c8 <_ChromeMain+0x341302c>
 34182ac: 90002aa9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 34182b0: 91180129     	add	x9, x9, #0x600
 34182b4: aa1403e0     	mov	x0, x20
 34182b8: eb09011f     	cmp	x8, x9
 34182bc: 54000120     	b.eq	0x34182e0 <_ChromeMain+0x3413044>
 34182c0: d63f0100     	blr	x8
 34182c4: 17ffffbc     	b	0x34181b4 <_ChromeMain+0x3412f18>
 34182c8: f9401a80     	ldr	x0, [x20, #0x30]
 34182cc: b5000480     	cbnz	x0, 0x341835c <_ChromeMain+0x34130c0>
 34182d0: aa1403e0     	mov	x0, x20
 34182d4: 52800901     	mov	w1, #0x48               ; =72
 34182d8: 972fc2f8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34182dc: 17ffffb6     	b	0x34181b4 <_ChromeMain+0x3412f18>
 34182e0: 52800701     	mov	w1, #0x38               ; =56
 34182e4: 17fffffd     	b	0x34182d8 <_ChromeMain+0x341303c>
 34182e8: 12800008     	mov	w8, #-0x1               ; =-1
 34182ec: b8e80288     	ldaddal	w8, w8, [x20]
 34182f0: 7100051f     	cmp	w8, #0x1
 34182f4: 54fff461     	b.ne	0x3418180 <_ChromeMain+0x3412ee4>
 34182f8: f9400a88     	ldr	x8, [x20, #0x10]
 34182fc: b0fedc69     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 3418300: 91190129     	add	x9, x9, #0x640
 3418304: eb09011f     	cmp	x8, x9
 3418308: 54000100     	b.eq	0x3418328 <_ChromeMain+0x341308c>
 341830c: 90002aa9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 3418310: 91180129     	add	x9, x9, #0x600
 3418314: aa1403e0     	mov	x0, x20
 3418318: eb09011f     	cmp	x8, x9
 341831c: 54000120     	b.eq	0x3418340 <_ChromeMain+0x34130a4>
 3418320: d63f0100     	blr	x8
 3418324: 17ffff97     	b	0x3418180 <_ChromeMain+0x3412ee4>
 3418328: f9401a80     	ldr	x0, [x20, #0x30]
 341832c: b50000e0     	cbnz	x0, 0x3418348 <_ChromeMain+0x34130ac>
 3418330: aa1403e0     	mov	x0, x20
 3418334: 52800901     	mov	w1, #0x48               ; =72
 3418338: 972fc2e0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 341833c: 17ffff91     	b	0x3418180 <_ChromeMain+0x3412ee4>
 3418340: 52800701     	mov	w1, #0x38               ; =56
 3418344: 17fffffd     	b	0x3418338 <_ChromeMain+0x341309c>
 3418348: 12800008     	mov	w8, #-0x1               ; =-1
 341834c: b8e80008     	ldaddal	w8, w8, [x0]
 3418350: 7100051f     	cmp	w8, #0x1
 3418354: 54fffee1     	b.ne	0x3418330 <_ChromeMain+0x3413094>
 3418358: 14000008     	b	0x3418378 <_ChromeMain+0x34130dc>
 341835c: 12800008     	mov	w8, #-0x1               ; =-1
 3418360: b8e80008     	ldaddal	w8, w8, [x0]
 3418364: 7100051f     	cmp	w8, #0x1
 3418368: 54fffb41     	b.ne	0x34182d0 <_ChromeMain+0x3413034>
 341836c: 52800101     	mov	w1, #0x8                ; =8
 3418370: 972fc2d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418374: 17ffffd7     	b	0x34182d0 <_ChromeMain+0x3413034>
 3418378: 52800101     	mov	w1, #0x8                ; =8
 341837c: 972fc2cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418380: 17ffffec     	b	0x3418330 <_ChromeMain+0x3413094>
 3418384: d4200000     	brk	#0
 3418388: d4400000     	hlt	#0
 341838c: d4200020     	brk	#0x1
 3418390: d2800014     	mov	x20, #0x0               ; =0
 3418394: 17ffffad     	b	0x3418248 <_ChromeMain+0x3412fac>
 3418398: f9401268     	ldr	x8, [x19, #0x20]
 341839c: b4ffffa8     	cbz	x8, 0x3418390 <_ChromeMain+0x34130f4>
 34183a0: f9400e60     	ldr	x0, [x19, #0x18]
 34183a4: 97b3afe9     	bl	0x2104348 <_ChromeMain+0x20ff0ac>
 34183a8: aa0003e1     	mov	x1, x0
 34183ac: 91022260     	add	x0, x19, #0x88
 34183b0: 973e0d5c     	bl	0x39b920 <_ChromeMain+0x396684>
 34183b4: f9401274     	ldr	x20, [x19, #0x20]
 34183b8: 17ffffa4     	b	0x3418248 <_ChromeMain+0x3412fac>
 34183bc: 9771d385     	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 34183c0: aa1503e1     	mov	x1, x21
 34183c4: 945ec7ca     	bl	0x4bca2ec <_ChromeMain+0x4bc5050>
 34183c8: 9771d382     	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 34183cc: aa1503e1     	mov	x1, x21
 34183d0: 52800022     	mov	w2, #0x1                ; =1
 34183d4: 9730ea70     	bl	0x52d94 <_ChromeMain+0x4daf8>
 34183d8: b4000060     	cbz	x0, 0x34183e4 <_ChromeMain+0x3413148>
 34183dc: d1004014     	sub	x20, x0, #0x10
 34183e0: b5ffe7b4     	cbnz	x20, 0x34180d4 <_ChromeMain+0x3412e38>
 34183e4: d4200000     	brk	#0
 34183e8: d4400000     	hlt	#0
 34183ec: d4200020     	brk	#0x1
 34183f0: f9400e60     	ldr	x0, [x19, #0x18]
 34183f4: 951b186e     	bl	0x7ade5ac <_ChromeMain+0x7ad9310>
 34183f8: b40009a0     	cbz	x0, 0x341852c <_ChromeMain+0x3413290>
 34183fc: aa0003f4     	mov	x20, x0
 3418400: f9405675     	ldr	x21, [x19, #0xa8]
 3418404: b40000d5     	cbz	x21, 0x341841c <_ChromeMain+0x3413180>
 3418408: 52800028     	mov	w8, #0x1                ; =1
 341840c: b82802a8     	ldadd	w8, w8, [x21]
 3418410: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3418414: 6b09011f     	cmp	w8, w9
 3418418: 54000900     	b.eq	0x3418538 <_ChromeMain+0x341329c>
 341841c: f9405a77     	ldr	x23, [x19, #0xb0]
 3418420: 52800900     	mov	w0, #0x48               ; =72
 3418424: 972fdbd1     	bl	0xf368 <_ChromeMain+0xa0cc>
 3418428: aa0003e1     	mov	x1, x0
 341842c: 52800036     	mov	w22, #0x1               ; =1
 3418430: b9000016     	str	w22, [x0]
 3418434: b0ffec28     	adrp	x8, 0x319d000 <_ChromeMain+0x3197d64>
 3418438: 913e8108     	add	x8, x8, #0xfa0
 341843c: f0002569     	adrp	x9, 0x38c7000 <_ChromeMain+0x38c1d64>
 3418440: 91240129     	add	x9, x9, #0x900
 3418444: a900a408     	stp	x8, x9, [x0, #0x8]
 3418448: f000d008     	adrp	x8, 0x4e1b000 <_ChromeMain+0x4e15d64>
 341844c: 91370108     	add	x8, x8, #0xdc0
 3418450: d0ffec29     	adrp	x9, 0x319e000 <_ChromeMain+0x3198d64>
 3418454: 9103c129     	add	x9, x9, #0xf0
 3418458: a901a408     	stp	x8, x9, [x0, #0x18]
 341845c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 3418460: f9001c17     	str	x23, [x0, #0x38]
 3418464: 39010016     	strb	w22, [x0, #0x40]
 3418468: aa1403e0     	mov	x0, x20
 341846c: 9400003c     	bl	0x341855c <_ChromeMain+0x34132c0>
 3418470: f9400e60     	ldr	x0, [x19, #0x18]
 3418474: 9746f929     	bl	0x5d6918 <_ChromeMain+0x5d167c>
 3418478: aa0003f4     	mov	x20, x0
 341847c: d0053540     	adrp	x0, 0xdac2000 <dyld_stub_binder+0xdac2000>
 3418480: 91307400     	add	x0, x0, #0xc1d
 3418484: d0053541     	adrp	x1, 0xdac2000 <dyld_stub_binder+0xdac2000>
 3418488: 91309421     	add	x1, x1, #0xc25
 341848c: 910083e8     	add	x8, sp, #0x20
 3418490: 52803102     	mov	w2, #0x188              ; =392
 3418494: 9730e1fb     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 3418498: f9405677     	ldr	x23, [x19, #0xa8]
 341849c: b40000b7     	cbz	x23, 0x34184b0 <_ChromeMain+0x3413214>
 34184a0: b83602e8     	ldadd	w22, w8, [x23]
 34184a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 34184a8: 6b09011f     	cmp	w8, w9
 34184ac: 540004c0     	b.eq	0x3418544 <_ChromeMain+0x34132a8>
 34184b0: f9405a78     	ldr	x24, [x19, #0xb0]
 34184b4: 52800800     	mov	w0, #0x40               ; =64
 34184b8: 972fdbac     	bl	0xf368 <_ChromeMain+0xa0cc>
 34184bc: aa0003f5     	mov	x21, x0
 34184c0: f0005d08     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 34184c4: 911c0108     	add	x8, x8, #0x700
 34184c8: d0005c29     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 34184cc: 91110129     	add	x9, x9, #0x440
 34184d0: b9000016     	str	w22, [x0]
 34184d4: f000d00a     	adrp	x10, 0x4e1b000 <_ChromeMain+0x4e15d64>
 34184d8: 9137014a     	add	x10, x10, #0xdc0
 34184dc: 9002364b     	adrp	x11, 0x7ae0000 <_ChromeMain+0x7adad64>
 34184e0: 9111816b     	add	x11, x11, #0x460
 34184e4: a900a408     	stp	x8, x9, [x0, #0x8]
 34184e8: a901ac0a     	stp	x10, x11, [x0, #0x18]
 34184ec: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 34184f0: f9001c18     	str	x24, [x0, #0x38]
 34184f4: 97dedc74     	bl	0x2bcf6c4 <_ChromeMain+0x2bca428>
 34184f8: f9400003     	ldr	x3, [x0]
 34184fc: b40000e3     	cbz	x3, 0x3418518 <_ChromeMain+0x341327c>
 3418500: 91002068     	add	x8, x3, #0x8
 3418504: 52800029     	mov	w9, #0x1                ; =1
 3418508: b8290108     	ldadd	w9, w8, [x8]
 341850c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3418510: 6b09011f     	cmp	w8, w9
 3418514: 540001e0     	b.eq	0x3418550 <_ChromeMain+0x34132b4>
 3418518: 9103c280     	add	x0, x20, #0xf0
 341851c: 910083e1     	add	x1, sp, #0x20
 3418520: aa1503e2     	mov	x2, x21
 3418524: 97b4d424     	bl	0x214d5b4 <_ChromeMain+0x2148318>
 3418528: 17ffff09     	b	0x341814c <_ChromeMain+0x3412eb0>
 341852c: d4200000     	brk	#0
 3418530: d4400000     	hlt	#0
 3418534: d4200020     	brk	#0x1
 3418538: d4200000     	brk	#0
 341853c: d4400000     	hlt	#0
 3418540: d4200020     	brk	#0x1
 3418544: d4200000     	brk	#0
 3418548: d4400000     	hlt	#0
 341854c: d4200020     	brk	#0x1
 3418550: d4200000     	brk	#0
 3418554: d4400000     	hlt	#0
 3418558: d4200020     	brk	#0x1
 341855c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 3418560: a9014ff4     	stp	x20, x19, [sp, #0x10]
 3418564: a9027bfd     	stp	x29, x30, [sp, #0x20]
 3418568: 910083fd     	add	x29, sp, #0x20
 341856c: aa0103f3     	mov	x19, x1
 3418570: f9402014     	ldr	x20, [x0, #0x40]
 3418574: f9408415     	ldr	x21, [x0, #0x108]
 3418578: b40000d5     	cbz	x21, 0x3418590 <_ChromeMain+0x34132f4>
 341857c: 52800028     	mov	w8, #0x1                ; =1
 3418580: b82802a8     	ldadd	w8, w8, [x21]
 3418584: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3418588: 6b09011f     	cmp	w8, w9
 341858c: 54000300     	b.eq	0x34185ec <_ChromeMain+0x3413350>
 3418590: f9408816     	ldr	x22, [x0, #0x110]
 3418594: 52800900     	mov	w0, #0x48               ; =72
 3418598: 972fdb74     	bl	0xf368 <_ChromeMain+0xa0cc>
 341859c: aa0003e1     	mov	x1, x0
 34185a0: 52800028     	mov	w8, #0x1                ; =1
 34185a4: b9000008     	str	w8, [x0]
 34185a8: f0001368     	adrp	x8, 0x3687000 <_ChromeMain+0x3681d64>
 34185ac: 913a8108     	add	x8, x8, #0xea0
 34185b0: b00023e9     	adrp	x9, 0x3895000 <_ChromeMain+0x388fd64>
 34185b4: 913d8129     	add	x9, x9, #0xf60
 34185b8: a900a408     	stp	x8, x9, [x0, #0x8]
 34185bc: b000cee8     	adrp	x8, 0x4df5000 <_ChromeMain+0x4defd64>
 34185c0: 91120108     	add	x8, x8, #0x480
 34185c4: f0001369     	adrp	x9, 0x3687000 <_ChromeMain+0x3681d64>
 34185c8: 913d8129     	add	x9, x9, #0xf60
 34185cc: a901a408     	stp	x8, x9, [x0, #0x18]
 34185d0: a902d41f     	stp	xzr, x21, [x0, #0x28]
 34185d4: a903cc16     	stp	x22, x19, [x0, #0x38]
 34185d8: aa1403e0     	mov	x0, x20
 34185dc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 34185e0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 34185e4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 34185e8: 17ef5c16     	b	0x2fef640 <_ChromeMain+0x2fea3a4>
 34185ec: d4200000     	brk	#0
 34185f0: d4400000     	hlt	#0
 34185f4: d4200020     	brk	#0x1
 34185f8: d10103ff     	sub	sp, sp, #0x40
 34185fc: a90157f6     	stp	x22, x21, [sp, #0x10]
 3418600: a9024ff4     	stp	x20, x19, [sp, #0x20]
 3418604: a9037bfd     	stp	x29, x30, [sp, #0x30]
 3418608: 9100c3fd     	add	x29, sp, #0x30
 341860c: aa0003f3     	mov	x19, x0
 3418610: 90056ea8     	adrp	x8, 0xe1ec000 <dyld_stub_binder+0xe1ec000>
 3418614: 91220108     	add	x8, x8, #0x880
 3418618: f9000008     	str	x8, [x0]
 341861c: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418620: 91194108     	add	x8, x8, #0x650
 3418624: 38bfc108     	ldaprb	w8, [x8]
 3418628: 37000348     	tbnz	w8, #0x0, 0x3418690 <_ChromeMain+0x34133f4>
 341862c: f005c954     	adrp	x20, 0xed43000 <dyld_stub_binder+0xed43000>
 3418630: 91194294     	add	x20, x20, #0x650
 3418634: aa1403e0     	mov	x0, x20
 3418638: 952fb0a2     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 341863c: 340002a0     	cbz	w0, 0x3418690 <_ChromeMain+0x34133f4>
 3418640: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418644: 9118e108     	add	x8, x8, #0x638
 3418648: f900091f     	str	xzr, [x8, #0x10]
 341864c: aa0803e9     	mov	x9, x8
 3418650: f8008d3f     	str	xzr, [x9, #0x8]!
 3418654: f9000109     	str	x9, [x8]
 3418658: 52800035     	mov	w21, #0x1               ; =1
 341865c: 089ffe95     	stlrb	w21, [x20]
 3418660: f005c680     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3418664: 9127c000     	add	x0, x0, #0x9f0
 3418668: 952fb099     	bl	0x80048cc <_ChromeMain+0x7fff630>
 341866c: 350018a0     	cbnz	w0, 0x3418980 <_ChromeMain+0x34136e4>
 3418670: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418674: 39594514     	ldrb	w20, [x8, #0x651]
 3418678: 39194515     	strb	w21, [x8, #0x651]
 341867c: f005c680     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3418680: 9127c000     	add	x0, x0, #0x9f0
 3418684: 952fb0a0     	bl	0x8004904 <_ChromeMain+0x7fff668>
 3418688: 350016c0     	cbnz	w0, 0x3418960 <_ChromeMain+0x34136c4>
 341868c: 37101134     	tbnz	w20, #0x2, 0x34188b0 <_ChromeMain+0x3413614>
 3418690: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418694: f9432100     	ldr	x0, [x8, #0x640]
 3418698: b4000460     	cbz	x0, 0x3418724 <_ChromeMain+0x3413488>
 341869c: aa0003f4     	mov	x20, x0
 34186a0: f9401288     	ldr	x8, [x20, #0x20]
 34186a4: eb08027f     	cmp	x19, x8
 34186a8: 54001263     	b.lo	0x34188f4 <_ChromeMain+0x3413658>
 34186ac: eb13011f     	cmp	x8, x19
 34186b0: 54001283     	b.lo	0x3418900 <_ChromeMain+0x3413664>
 34186b4: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 34186b8: 91190108     	add	x8, x8, #0x640
 34186bc: eb08029f     	cmp	x20, x8
 34186c0: 54000320     	b.eq	0x3418724 <_ChromeMain+0x3413488>
 34186c4: 91008295     	add	x21, x20, #0x20
 34186c8: f9400689     	ldr	x9, [x20, #0x8]
 34186cc: b5001069     	cbnz	x9, 0x34188d8 <_ChromeMain+0x341363c>
 34186d0: aa1403e8     	mov	x8, x20
 34186d4: aa0803e9     	mov	x9, x8
 34186d8: f9400908     	ldr	x8, [x8, #0x10]
 34186dc: f940010a     	ldr	x10, [x8]
 34186e0: eb0a013f     	cmp	x9, x10
 34186e4: 54ffff81     	b.ne	0x34186d4 <_ChromeMain+0x3413438>
 34186e8: f005c949     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 34186ec: f9431d2a     	ldr	x10, [x9, #0x638]
 34186f0: eb14015f     	cmp	x10, x20
 34186f4: 54000041     	b.ne	0x34186fc <_ChromeMain+0x3413460>
 34186f8: f9031d28     	str	x8, [x9, #0x638]
 34186fc: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418700: f9432509     	ldr	x9, [x8, #0x648]
 3418704: d1000529     	sub	x9, x9, #0x1
 3418708: f9032509     	str	x9, [x8, #0x648]
 341870c: aa1403e1     	mov	x1, x20
 3418710: 9733baef     	bl	0x1072cc <_ChromeMain+0x102030>
 3418714: b4000eb5     	cbz	x21, 0x34188e8 <_ChromeMain+0x341364c>
 3418718: aa1403e0     	mov	x0, x20
 341871c: 52800501     	mov	w1, #0x28               ; =40
 3418720: 972fc1e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418724: f9005a7f     	str	xzr, [x19, #0xb0]
 3418728: f9405668     	ldr	x8, [x19, #0xa8]
 341872c: b4000168     	cbz	x8, 0x3418758 <_ChromeMain+0x34134bc>
 3418730: 52800029     	mov	w9, #0x1                ; =1
 3418734: 19004109     	stlurb	w9, [x8, #0x4]
 3418738: f9405660     	ldr	x0, [x19, #0xa8]
 341873c: b40000e0     	cbz	x0, 0x3418758 <_ChromeMain+0x34134bc>
 3418740: 12800008     	mov	w8, #-0x1               ; =-1
 3418744: b8e80008     	ldaddal	w8, w8, [x0]
 3418748: 7100051f     	cmp	w8, #0x1
 341874c: 54000061     	b.ne	0x3418758 <_ChromeMain+0x34134bc>
 3418750: 52800101     	mov	w1, #0x8                ; =8
 3418754: 972fc1d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418758: 91022260     	add	x0, x19, #0x88
 341875c: 979c603e     	bl	0x1b30854 <_ChromeMain+0x1b2b5b8>
 3418760: f9404260     	ldr	x0, [x19, #0x80]
 3418764: f900427f     	str	xzr, [x19, #0x80]
 3418768: b4000080     	cbz	x0, 0x3418778 <_ChromeMain+0x34134dc>
 341876c: 97c47017     	bl	0x25347c8 <_ChromeMain+0x252f52c>
 3418770: 52800301     	mov	w1, #0x18               ; =24
 3418774: 972fc1d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418778: f9403e74     	ldr	x20, [x19, #0x78]
 341877c: f9003e7f     	str	xzr, [x19, #0x78]
