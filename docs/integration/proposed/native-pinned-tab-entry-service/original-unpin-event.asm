
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d7ce0: d10503ff     	sub	sp, sp, #0x140
 41d7ce4: a9106ffc     	stp	x28, x27, [sp, #0x100]
 41d7ce8: a91157f6     	stp	x22, x21, [sp, #0x110]
 41d7cec: a9124ff4     	stp	x20, x19, [sp, #0x120]
 41d7cf0: a9137bfd     	stp	x29, x30, [sp, #0x130]
 41d7cf4: 9104c3fd     	add	x29, sp, #0x130
 41d7cf8: aa0103f4     	mov	x20, x1
 41d7cfc: aa0003f3     	mov	x19, x0
 41d7d00: f9003bff     	str	xzr, [sp, #0x70]
 41d7d04: 6f00e400     	movi.2d	v0, #0000000000000000
 41d7d08: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41d7d0c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d7d10: ad0083e0     	stp	q0, q0, [sp, #0x10]
 41d7d14: 3d8003e0     	str	q0, [sp]
 41d7d18: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 41d7d1c: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 41d7d20: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 41d7d24: ad0403e0     	stp	q0, q0, [sp, #0x80]
 41d7d28: aa0003f5     	mov	x21, x0
 41d7d2c: a9c62eaa     	ldp	x10, x11, [x21, #0x60]!
 41d7d30: d379e168     	lsl	x8, x11, #7
 41d7d34: b9401029     	ldr	w9, [x1, #0x10]
 41d7d38: b4000668     	cbz	x8, 0x41d7e04 <_ChromeMain+0x41d2b68>
 41d7d3c: 9347fd0c     	asr	x12, x8, #7
 41d7d40: aa0a03e8     	mov	x8, x10
 41d7d44: d341fd8d     	lsr	x13, x12, #1
 41d7d48: 8b0d1d0e     	add	x14, x8, x13, lsl #7
 41d7d4c: b84805cf     	ldr	w15, [x14], #0x80
 41d7d50: aa6c07f0     	mvn	x16, x12, lsr #1
 41d7d54: 8b10018c     	add	x12, x12, x16
 41d7d58: 6b0901ff     	cmp	w15, w9
 41d7d5c: 9a8db18c     	csel	x12, x12, x13, lt
 41d7d60: 9a88b1c8     	csel	x8, x14, x8, lt
 41d7d64: b5ffff0c     	cbnz	x12, 0x41d7d44 <_ChromeMain+0x41d2aa8>
 41d7d68: 8b0b1d4a     	add	x10, x10, x11, lsl #7
 41d7d6c: eb0a011f     	cmp	x8, x10
 41d7d70: 54000080     	b.eq	0x41d7d80 <_ChromeMain+0x41d2ae4>
 41d7d74: b940010a     	ldr	w10, [x8]
 41d7d78: 6b0a013f     	cmp	w9, w10
 41d7d7c: 5400016a     	b.ge	0x41d7da8 <_ChromeMain+0x41d2b0c>
 41d7d80: f9402288     	ldr	x8, [x20, #0x40]
 41d7d84: b4000b28     	cbz	x8, 0x41d7ee8 <_ChromeMain+0x41d2c4c>
 41d7d88: b00547e1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 41d7d8c: 9126c021     	add	x1, x1, #0x9b0
 41d7d90: 91002100     	add	x0, x8, #0x8
 41d7d94: 96f9ecf7     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d7d98: b40003a0     	cbz	x0, 0x41d7e0c <_ChromeMain+0x41d2b70>
 41d7d9c: aa0003e8     	mov	x8, x0
 41d7da0: 39408009     	ldrb	w9, [x0, #0x20]
 41d7da4: 34000349     	cbz	w9, 0x41d7e0c <_ChromeMain+0x41d2b70>
 41d7da8: 910203e0     	add	x0, sp, #0x80
 41d7dac: 91002101     	add	x1, x8, #0x8
 41d7db0: 96fd8879     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7db4: 52800028     	mov	w8, #0x1                ; =1
 41d7db8: 3903e3e8     	strb	w8, [sp, #0xf8]
 41d7dbc: 910203f6     	add	x22, sp, #0x80
 41d7dc0: 910003e0     	mov	x0, sp
 41d7dc4: 910203e1     	add	x1, sp, #0x80
 41d7dc8: 96fd8873     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7dcc: 3943e3e8     	ldrb	w8, [sp, #0xf8]
 41d7dd0: 340009c8     	cbz	w8, 0x41d7f08 <_ChromeMain+0x41d2c6c>
 41d7dd4: 9101c2c0     	add	x0, x22, #0x70
 41d7dd8: d2800001     	mov	x1, #0x0                ; =0
 41d7ddc: 96f93fb7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d7de0: 910082c0     	add	x0, x22, #0x20
 41d7de4: 96f93fa5     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d7de8: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 41d7dec: 36f808e8     	tbz	w8, #0x1f, 0x41d7f08 <_ChromeMain+0x41d2c6c>
 41d7df0: f94043e0     	ldr	x0, [sp, #0x80]
 41d7df4: f9404be8     	ldr	x8, [sp, #0x90]
 41d7df8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d7dfc: 96f8c42f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d7e00: 14000042     	b	0x41d7f08 <_ChromeMain+0x41d2c6c>
 41d7e04: aa0a03e8     	mov	x8, x10
 41d7e08: 17ffffd8     	b	0x41d7d68 <_ChromeMain+0x41d2acc>
 41d7e0c: f9402296     	ldr	x22, [x20, #0x40]
 41d7e10: 390203ff     	strb	wzr, [sp, #0x80]
 41d7e14: 3903e3ff     	strb	wzr, [sp, #0xf8]
 41d7e18: b4000696     	cbz	x22, 0x41d7ee8 <_ChromeMain+0x41d2c4c>
 41d7e1c: f9003bff     	str	xzr, [sp, #0x70]
 41d7e20: 6f00e400     	movi.2d	v0, #0000000000000000
 41d7e24: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41d7e28: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d7e2c: ad0083e0     	stp	q0, q0, [sp, #0x10]
 41d7e30: 3d8003e0     	str	q0, [sp]
 41d7e34: f9414ac8     	ldr	x8, [x22, #0x290]
 41d7e38: b5000da8     	cbnz	x8, 0x41d7fec <_ChromeMain+0x41d2d50>
 41d7e3c: f94132c8     	ldr	x8, [x22, #0x260]
 41d7e40: f9401d09     	ldr	x9, [x8, #0x38]
 41d7e44: d0fff36a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 41d7e48: 913c814a     	add	x10, x10, #0xf20
 41d7e4c: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 41d7e50: eb0a013f     	cmp	x9, x10
 41d7e54: 54000fa1     	b.ne	0x41d8048 <_ChromeMain+0x41d2dac>
 41d7e58: 3100051f     	cmn	w8, #0x1
 41d7e5c: 540011a0     	b.eq	0x41d8090 <_ChromeMain+0x41d2df4>
 41d7e60: f94142c9     	ldr	x9, [x22, #0x280]
 41d7e64: eb08013f     	cmp	x9, x8
 41d7e68: 54001049     	b.ls	0x41d8070 <_ChromeMain+0x41d2dd4>
 41d7e6c: f9413ec9     	ldr	x9, [x22, #0x278]
 41d7e70: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d7e74: b4001088     	cbz	x8, 0x41d8084 <_ChromeMain+0x41d2de8>
 41d7e78: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d7e7c: b7f80fc9     	tbnz	x9, #0x3f, 0x41d8074 <_ChromeMain+0x41d2dd8>
 41d7e80: b5000fe9     	cbnz	x9, 0x41d807c <_ChromeMain+0x41d2de0>
 41d7e84: f9400d08     	ldr	x8, [x8, #0x18]
 41d7e88: f9400508     	ldr	x8, [x8, #0x8]
 41d7e8c: 91018101     	add	x1, x8, #0x60
 41d7e90: 910003e0     	mov	x0, sp
 41d7e94: 96fd8840     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7e98: 394063e8     	ldrb	w8, [sp, #0x18]
 41d7e9c: 37000368     	tbnz	w8, #0x0, 0x41d7f08 <_ChromeMain+0x41d2c6c>
 41d7ea0: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 41d7ea4: 3100051f     	cmn	w8, #0x1
 41d7ea8: 54001020     	b.eq	0x41d80ac <_ChromeMain+0x41d2e10>
 41d7eac: f94142c9     	ldr	x9, [x22, #0x280]
 41d7eb0: eb08013f     	cmp	x9, x8
 41d7eb4: 54000de9     	b.ls	0x41d8070 <_ChromeMain+0x41d2dd4>
 41d7eb8: f9413ec9     	ldr	x9, [x22, #0x278]
 41d7ebc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d7ec0: b4000fc8     	cbz	x8, 0x41d80b8 <_ChromeMain+0x41d2e1c>
 41d7ec4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d7ec8: b7f80ea9     	tbnz	x9, #0x3f, 0x41d809c <_ChromeMain+0x41d2e00>
 41d7ecc: b5000ec9     	cbnz	x9, 0x41d80a4 <_ChromeMain+0x41d2e08>
 41d7ed0: f9400d08     	ldr	x8, [x8, #0x18]
 41d7ed4: f9400508     	ldr	x8, [x8, #0x8]
 41d7ed8: 91018101     	add	x1, x8, #0x60
 41d7edc: 910003e0     	mov	x0, sp
 41d7ee0: 970bce8b     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d7ee4: 14000009     	b	0x41d7f08 <_ChromeMain+0x41d2c6c>
 41d7ee8: a9007fff     	stp	xzr, xzr, [sp]
 41d7eec: b80173ff     	stur	wzr, [sp, #0x17]
 41d7ef0: f9000bff     	str	xzr, [sp, #0x10]
 41d7ef4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 41d7ef8: ad0103e0     	stp	q0, q0, [sp, #0x20]
 41d7efc: ad0203e0     	stp	q0, q0, [sp, #0x40]
 41d7f00: 7900c3ff     	strh	wzr, [sp, #0x60]
 41d7f04: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 41d7f08: b9401288     	ldr	w8, [x20, #0x10]
 41d7f0c: b90083e8     	str	w8, [sp, #0x80]
 41d7f10: 910203f6     	add	x22, sp, #0x80
 41d7f14: 910203e1     	add	x1, sp, #0x80
 41d7f18: aa1503e0     	mov	x0, x21
 41d7f1c: 97fffe0f     	bl	0x41d7758 <_ChromeMain+0x41d24bc>
 41d7f20: f9402288     	ldr	x8, [x20, #0x40]
 41d7f24: b40000a8     	cbz	x8, 0x41d7f38 <_ChromeMain+0x41d2c9c>
 41d7f28: b00547e1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 41d7f2c: 9126c021     	add	x1, x1, #0x9b0
 41d7f30: 91002100     	add	x0, x8, #0x8
 41d7f34: 97422b5a     	bl	0x1262c9c <_ChromeMain+0x125da00>
 41d7f38: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 41d7f3c: b80973ff     	stur	wzr, [sp, #0x97]
 41d7f40: f9004bff     	str	xzr, [sp, #0x90]
 41d7f44: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 41d7f48: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 41d7f4c: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 41d7f50: 7901c3ff     	strh	wzr, [sp, #0xe0]
 41d7f54: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 41d7f58: 910203e1     	add	x1, sp, #0x80
 41d7f5c: aa1403e0     	mov	x0, x20
 41d7f60: 9400009c     	bl	0x41d81d0 <_ChromeMain+0x41d2f34>
 41d7f64: 9101c2c0     	add	x0, x22, #0x70
 41d7f68: d2800001     	mov	x1, #0x0                ; =0
 41d7f6c: 96f93f53     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d7f70: 910082c0     	add	x0, x22, #0x20
 41d7f74: 96f93f41     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d7f78: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 41d7f7c: 36f800a8     	tbz	w8, #0x1f, 0x41d7f90 <_ChromeMain+0x41d2cf4>
 41d7f80: f94043e0     	ldr	x0, [sp, #0x80]
 41d7f84: f9404be8     	ldr	x8, [sp, #0x90]
 41d7f88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d7f8c: 96f8c3cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d7f90: 394063e8     	ldrb	w8, [sp, #0x18]
 41d7f94: 34000088     	cbz	w8, 0x41d7fa4 <_ChromeMain+0x41d2d08>
 41d7f98: f9402260     	ldr	x0, [x19, #0x40]
 41d7f9c: 910003e1     	mov	x1, sp
 41d7fa0: 97fff3e0     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 41d7fa4: 910003f3     	mov	x19, sp
 41d7fa8: 9101c260     	add	x0, x19, #0x70
 41d7fac: d2800001     	mov	x1, #0x0                ; =0
 41d7fb0: 96f93f42     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d7fb4: 91008260     	add	x0, x19, #0x20
 41d7fb8: 96f93f30     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d7fbc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41d7fc0: 36f800a8     	tbz	w8, #0x1f, 0x41d7fd4 <_ChromeMain+0x41d2d38>
 41d7fc4: f94003e0     	ldr	x0, [sp]
 41d7fc8: f9400be8     	ldr	x8, [sp, #0x10]
 41d7fcc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d7fd0: 96f8c3ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d7fd4: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 41d7fd8: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 41d7fdc: a95157f6     	ldp	x22, x21, [sp, #0x110]
 41d7fe0: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 41d7fe4: 910503ff     	add	sp, sp, #0x140
 41d7fe8: d65f03c0     	ret
 41d7fec: b942bac9     	ldr	w9, [x22, #0x2b8]
 41d7ff0: 3100053f     	cmn	w9, #0x1
 41d7ff4: 54000341     	b.ne	0x41d805c <_ChromeMain+0x41d2dc0>
 41d7ff8: 394d2109     	ldrb	w9, [x8, #0x348]
 41d7ffc: 34fff3e9     	cbz	w9, 0x41d7e78 <_ChromeMain+0x41d2bdc>
 41d8000: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 41d8004: 34fff1c9     	cbz	w9, 0x41d7e3c <_ChromeMain+0x41d2ba0>
 41d8008: b982b6c9     	ldrsw	x9, [x22, #0x2b4]
 41d800c: 3100053f     	cmn	w9, #0x1
 41d8010: 540005a0     	b.eq	0x41d80c4 <_ChromeMain+0x41d2e28>
 41d8014: f94142ca     	ldr	x10, [x22, #0x280]
 41d8018: eb09015f     	cmp	x10, x9
 41d801c: 540002a9     	b.ls	0x41d8070 <_ChromeMain+0x41d2dd4>
 41d8020: f9413eca     	ldr	x10, [x22, #0x278]
 41d8024: f8697949     	ldr	x9, [x10, x9, lsl #3]
 41d8028: b9443129     	ldr	w9, [x9, #0x430]
 41d802c: 7100093f     	cmp	w9, #0x2
 41d8030: 54fff060     	b.eq	0x41d7e3c <_ChromeMain+0x41d2ba0>
 41d8034: f94136c9     	ldr	x9, [x22, #0x268]
 41d8038: b40004c9     	cbz	x9, 0x41d80d0 <_ChromeMain+0x41d2e34>
 41d803c: 39458129     	ldrb	w9, [x9, #0x160]
 41d8040: 3707efe9     	tbnz	w9, #0x0, 0x41d7e3c <_ChromeMain+0x41d2ba0>
 41d8044: 17ffff8d     	b	0x41d7e78 <_ChromeMain+0x41d2bdc>
 41d8048: 3100051f     	cmn	w8, #0x1
 41d804c: 54fff0a1     	b.ne	0x41d7e60 <_ChromeMain+0x41d2bc4>
 41d8050: d4200000     	brk	#0
 41d8054: d4400000     	hlt	#0
 41d8058: d4200020     	brk	#0x1
 41d805c: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 41d8060: 34ffeee9     	cbz	w9, 0x41d7e3c <_ChromeMain+0x41d2ba0>
 41d8064: 394d2109     	ldrb	w9, [x8, #0x348]
 41d8068: 35ffeea9     	cbnz	w9, 0x41d7e3c <_ChromeMain+0x41d2ba0>
 41d806c: 17ffff83     	b	0x41d7e78 <_ChromeMain+0x41d2bdc>
 41d8070: d4200020     	brk	#0x1
 41d8074: f9401909     	ldr	x9, [x8, #0x30]
 41d8078: b4fff069     	cbz	x9, 0x41d7e84 <_ChromeMain+0x41d2be8>
 41d807c: 9100a101     	add	x1, x8, #0x28
 41d8080: 17ffff84     	b	0x41d7e90 <_ChromeMain+0x41d2bf4>
 41d8084: 97e24a7d     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d8088: aa0003e1     	mov	x1, x0
 41d808c: 17ffff81     	b	0x41d7e90 <_ChromeMain+0x41d2bf4>
 41d8090: d4200000     	brk	#0
 41d8094: d4400000     	hlt	#0
 41d8098: d4200020     	brk	#0x1
 41d809c: f9401909     	ldr	x9, [x8, #0x30]
 41d80a0: b4fff189     	cbz	x9, 0x41d7ed0 <_ChromeMain+0x41d2c34>
 41d80a4: 9100a101     	add	x1, x8, #0x28
 41d80a8: 17ffff8d     	b	0x41d7edc <_ChromeMain+0x41d2c40>
 41d80ac: d4200000     	brk	#0
 41d80b0: d4400000     	hlt	#0
 41d80b4: d4200020     	brk	#0x1
 41d80b8: 97e24a70     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d80bc: aa0003e1     	mov	x1, x0
 41d80c0: 17ffff87     	b	0x41d7edc <_ChromeMain+0x41d2c40>
 41d80c4: d4200000     	brk	#0
 41d80c8: d4400000     	hlt	#0
 41d80cc: d4200020     	brk	#0x1
 41d80d0: d4200000     	brk	#0
 41d80d4: d4400000     	hlt	#0
 41d80d8: d4200020     	brk	#0x1
