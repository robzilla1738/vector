
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4127d28:      	sub	sp, sp, #0x70
 4127d2c:      	stp	x28, x27, [sp, #0x10]
 4127d30:      	stp	x26, x25, [sp, #0x20]
 4127d34:      	stp	x24, x23, [sp, #0x30]
 4127d38:      	stp	x22, x21, [sp, #0x40]
 4127d3c:      	stp	x20, x19, [sp, #0x50]
 4127d40:      	stp	x29, x30, [sp, #0x60]
 4127d44:      	add	x29, sp, #0x60
 4127d48:      	mov	x22, x2
 4127d4c:      	mov	x20, x1
 4127d50:      	mov	x19, x0
 4127d54:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4127d58:      	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 4127d5c:      	add	x8, x8, #0xf08
 4127d60:      	str	x8, [x0, #0x310]
 4127d64:      	mov	w0, #0x8                ; =8
 4127d68:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4127d6c:      	str	wzr, [x0]
 4127d70:      	strb	wzr, [x0, #0x4]
 4127d74:      	cbz	x0, 0x4127d8c <_ChromeMain+0x4122af0>
 4127d78:      	mov	w8, #0x1                ; =1
 4127d7c:      	ldadd	w8, w8, [x0]
 4127d80:      	mov	w9, #0x7fffffff         ; =2147483647
 4127d84:      	cmp	w8, w9
 4127d88:      	b.eq	0x4128684 <_ChromeMain+0x41233e8>
 4127d8c:      	add	x25, x19, #0x310
 4127d90:      	str	x0, [x19, #0x318]
 4127d94:      	adrp	x8, 0xe5a5000 <dyld_stub_binder+0xe5a5000>
 4127d98:      	add	x8, x8, #0x7f0
 4127d9c:      	str	x25, [x19, #0x320]
 4127da0:      	add	x9, x8, #0x3f0
 4127da4:      	stp	x8, x9, [x19]
 4127da8:      	add	x9, x8, #0x418
 4127dac:      	str	x9, [x19, #0x10]
 4127db0:      	add	x9, x8, #0x450
 4127db4:      	add	x10, x8, #0x480
 4127db8:      	stp	x9, x10, [x19, #0x68]
 4127dbc:      	add	x9, x8, #0x4d0
 4127dc0:      	str	x9, [x19, #0xb0]
 4127dc4:      	add	x9, x8, #0x530
 4127dc8:      	mov	x21, x19
 4127dcc:      	str	x9, [x21, #0xd8]!
 4127dd0:      	add	x9, x8, #0x560
 4127dd4:      	str	x9, [x19, #0xf8]
 4127dd8:      	add	x8, x8, #0x588
 4127ddc:      	str	x8, [x19, #0x310]
 4127de0:      	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127de4:      	ldr	x26, [x23, #0x88]
 4127de8:      	and	x8, x20, #0xfffffffc00000000
 4127dec:      	cmp	x8, x26
 4127df0:      	b.ne	0x4127e00 <_ChromeMain+0x4122b64>
 4127df4:      	mov	x0, x20
 4127df8:      	bl	0x142fc <_ChromeMain+0xf060>
 4127dfc:      	ldr	x26, [x23, #0x88]
 4127e00:      	str	x20, [x19, #0x328]
 4127e04:      	add	x24, x19, #0x330
 4127e08:      	movi.2d	v0, #0000000000000000
 4127e0c:      	stp	q0, q0, [x19, #0x330]
 4127e10:      	str	q0, [x19, #0x350]
 4127e14:      	stur	q0, [x24, #0x29]
 4127e18:      	strb	w22, [x19, #0x369]
 4127e1c:      	strb	wzr, [x19, #0x370]
 4127e20:      	strb	wzr, [x19, #0x378]
 4127e24:      	strb	wzr, [x19, #0x380]
 4127e28:      	ldr	w27, [x20, #0x150]
 4127e2c:      	mov	w0, #0x40               ; =64
 4127e30:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4127e34:      	mov	x22, x0
 4127e38:      	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 4127e3c:      	add	x8, x8, #0x9a0
 4127e40:      	str	x8, [x0]
 4127e44:      	str	w27, [x0, #0x8]
 4127e48:      	stp	xzr, xzr, [x0, #0x18]
 4127e4c:      	str	xzr, [x0, #0x10]
 4127e50:      	and	x8, x0, #0xfffffffc00000000
 4127e54:      	cmp	x8, x26
 4127e58:      	b.ne	0x4127e68 <_ChromeMain+0x4122bcc>
 4127e5c:      	mov	x0, x22
 4127e60:      	bl	0x142fc <_ChromeMain+0xf060>
 4127e64:      	ldr	x26, [x23, #0x88]
 4127e68:      	mov	w8, #0x1                ; =1
 4127e6c:      	stp	x22, x8, [x22, #0x28]
 4127e70:      	str	x22, [x19, #0x388]
 4127e74:      	and	x8, x25, #0xfffffffc00000000
 4127e78:      	movi.2d	v0, #0000000000000000
 4127e7c:      	stp	q0, q0, [x19, #0x390]
 4127e80:      	str	xzr, [x19, #0x3b0]
 4127e84:      	cmp	x8, x26
 4127e88:      	b.ne	0x4127e94 <_ChromeMain+0x4122bf8>
 4127e8c:      	add	x0, x19, #0x310
 4127e90:      	bl	0x142fc <_ChromeMain+0xf060>
 4127e94:      	str	x25, [x19, #0x3b8]
 4127e98:      	str	xzr, [x19, #0x3c0]
 4127e9c:      	mov	w0, #0x8                ; =8
 4127ea0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4127ea4:      	str	wzr, [x0]
 4127ea8:      	strb	wzr, [x0, #0x4]
 4127eac:      	cbz	x0, 0x4127ec4 <_ChromeMain+0x4122c28>
 4127eb0:      	mov	w8, #0x1                ; =1
 4127eb4:      	ldadd	w8, w8, [x0]
 4127eb8:      	mov	w9, #0x7fffffff         ; =2147483647
 4127ebc:      	cmp	w8, w9
 4127ec0:      	b.eq	0x4128690 <_ChromeMain+0x41233f4>
 4127ec4:      	str	x0, [x19, #0x3c8]
 4127ec8:      	str	x19, [x19, #0x3d0]
 4127ecc:      	mov	x0, x19
 4127ed0:      	mov	w1, #0x1                ; =1
 4127ed4:      	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4127ed8:      	ldr	x8, [x19, #0x20]
 4127edc:      	ldr	w9, [x8, #0x8]
 4127ee0:      	cmp	w9, #0x2
 4127ee4:      	b.eq	0x4128654 <_ChromeMain+0x41233b8>
 4127ee8:      	ldrb	w9, [x8, #0x8a]
 4127eec:      	cbz	w9, 0x4127f04 <_ChromeMain+0x4122c68>
 4127ef0:      	strb	wzr, [x8, #0x8a]
 4127ef4:      	ldr	x0, [x8, #0x168]
 4127ef8:      	mov	w1, #0x0                ; =0
 4127efc:      	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4127f00:      	ldr	x8, [x19, #0x20]
 4127f04:      	ldr	x0, [x8, #0x168]
 4127f08:      	mov	w1, #0x1                ; =1
 4127f0c:      	bl	0x2218844 <_ChromeMain+0x22135a8>
 4127f10:      	ldr	w25, [x20, #0x150]
 4127f14:      	mov	w0, #0xf8               ; =248
 4127f18:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4127f1c:      	mov	x22, x0
 4127f20:      	bl	0x14856e0 <_ChromeMain+0x1480444>
 4127f24:      	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 4127f28:      	add	x8, x8, #0xa80
 4127f2c:      	str	x8, [x0]
 4127f30:      	add	x8, x8, #0xd8
 4127f34:      	str	x8, [x0, #0x28]
 4127f38:      	str	w25, [x0, #0xf0]
 4127f3c:      	mov	x0, x19
 4127f40:      	mov	x1, x22
 4127f44:      	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4127f48:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4127f4c:      	add	x1, x1, #0x688
 4127f50:      	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 4127f54:      	add	x2, x2, #0x4c0
 4127f58:      	mov	x0, x21
 4127f5c:      	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 4127f60:      	mov	x0, x19
 4127f64:      	mov	w1, #0x1                ; =1
 4127f68:      	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4127f6c:      	ldr	x8, [x19, #0x20]
 4127f70:      	ldr	w9, [x8, #0x8]
 4127f74:      	cmp	w9, #0x2
 4127f78:      	b.eq	0x4128660 <_ChromeMain+0x41233c4>
 4127f7c:      	ldrb	w9, [x8, #0x8a]
 4127f80:      	cbz	w9, 0x4127f94 <_ChromeMain+0x4122cf8>
 4127f84:      	strb	wzr, [x8, #0x8a]
 4127f88:      	ldr	x0, [x8, #0x168]
 4127f8c:      	mov	w1, #0x0                ; =0
 4127f90:      	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4127f94:      	adrp	x22, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4127f98:      	add	x22, x22, #0x480
 4127f9c:      	ldapr	x0, [x22]
 4127fa0:      	cbz	x0, 0x412863c <_ChromeMain+0x41233a0>
 4127fa4:      	mov	w1, #0x460              ; =1120
 4127fa8:      	mov	x2, #0x0                ; =0
 4127fac:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 4127fb0:      	mov	x21, x0
 4127fb4:      	mov	w1, #0x1                ; =1
 4127fb8:      	bl	0xa6a5248 <_ChromeMain+0xa69ffac>
 4127fbc:      	ldrb	w8, [x0, #0x169]
 4127fc0:      	cbnz	w8, 0x412866c <_ChromeMain+0x41233d0>
 4127fc4:      	ldr	x2, [x19, #0x198]
 4127fc8:      	mov	x0, x19
 4127fcc:      	mov	x1, x21
 4127fd0:      	bl	0x7793fc <_ChromeMain+0x774160>
 4127fd4:      	and	x8, x21, #0xfffffffc00000000
 4127fd8:      	ldr	x9, [x23, #0x88]
 4127fdc:      	cmp	x8, x9
 4127fe0:      	b.ne	0x4127fec <_ChromeMain+0x4122d50>
 4127fe4:      	mov	x0, x21
 4127fe8:      	bl	0x142fc <_ChromeMain+0xf060>
 4127fec:      	ldr	x0, [x24]
 4127ff0:      	and	x8, x0, #0xfffffffc00000000
 4127ff4:      	ldr	x9, [x23, #0x88]
 4127ff8:      	cmp	x8, x9
 4127ffc:      	b.ne	0x4128004 <_ChromeMain+0x4122d68>
 4128000:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4128004:      	str	x21, [x19, #0x330]
 4128008:      	mov	x0, x19
 412800c:      	mov	x1, x21
 4128010:      	bl	0x78aa440 <_ChromeMain+0x78a51a4>
 4128014:      	ldapr	x0, [x22]
 4128018:      	cbz	x0, 0x4128644 <_ChromeMain+0x41233a8>
 412801c:      	mov	w1, #0x320              ; =800
 4128020:      	mov	x2, #0x0                ; =0
 4128024:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 4128028:      	mov	x21, x0
 412802c:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4128030:      	adrp	x8, 0xe6bc000 <dyld_stub_binder+0xe6bc000>
 4128034:      	add	x8, x8, #0x1f0
 4128038:      	add	x9, x8, #0x3e8
 412803c:      	stp	x8, x9, [x0]
 4128040:      	add	x9, x8, #0x410
 4128044:      	str	x9, [x0, #0x10]
 4128048:      	add	x9, x8, #0x448
 412804c:      	add	x10, x8, #0x478
 4128050:      	stp	x9, x10, [x0, #0x68]
 4128054:      	add	x9, x8, #0x4c8
 4128058:      	str	x9, [x0, #0xb0]
 412805c:      	add	x9, x8, #0x528
 4128060:      	str	x9, [x0, #0xd8]
 4128064:      	add	x8, x8, #0x558
 4128068:      	str	x8, [x0, #0xf8]
 412806c:      	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4128070:      	ldr	q0, [x8, #0xb0]
 4128074:      	str	q0, [x0, #0x310]
 4128078:      	ldrb	w8, [x0, #0x169]
 412807c:      	cbnz	w8, 0x4128678 <_ChromeMain+0x41233dc>
 4128080:      	ldr	x2, [x19, #0x198]
 4128084:      	mov	x0, x19
 4128088:      	mov	x1, x21
 412808c:      	bl	0x7793fc <_ChromeMain+0x774160>
 4128090:      	and	x8, x21, #0xfffffffc00000000
 4128094:      	ldr	x9, [x23, #0x88]
 4128098:      	cmp	x8, x9
 412809c:      	b.ne	0x41280a8 <_ChromeMain+0x4122e0c>
 41280a0:      	mov	x0, x21
 41280a4:      	bl	0x142fc <_ChromeMain+0xf060>
 41280a8:      	ldr	x0, [x19, #0x350]
 41280ac:      	and	x8, x0, #0xfffffffc00000000
 41280b0:      	ldr	x9, [x23, #0x88]
 41280b4:      	cmp	x8, x9
 41280b8:      	b.ne	0x41280c0 <_ChromeMain+0x4122e24>
 41280bc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41280c0:      	str	x21, [x19, #0x350]
 41280c4:      	ldapr	x0, [x22]
 41280c8:      	cbz	x0, 0x412864c <_ChromeMain+0x41233b0>
 41280cc:      	mov	w1, #0x460              ; =1120
 41280d0:      	mov	x2, #0x0                ; =0
 41280d4:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 41280d8:      	mov	x21, x0
 41280dc:      	mov	w1, #0x1                ; =1
 41280e0:      	bl	0xa6a5248 <_ChromeMain+0xa69ffac>
 41280e4:      	ldrb	w8, [x0, #0x169]
 41280e8:      	cbnz	w8, 0x4128630 <_ChromeMain+0x4123394>
 41280ec:      	ldr	x2, [x19, #0x198]
 41280f0:      	mov	x0, x19
 41280f4:      	mov	x1, x21
 41280f8:      	bl	0x7793fc <_ChromeMain+0x774160>
 41280fc:      	and	x8, x21, #0xfffffffc00000000
 4128100:      	ldr	x9, [x23, #0x88]
 4128104:      	cmp	x8, x9
 4128108:      	b.ne	0x4128114 <_ChromeMain+0x4122e78>
 412810c:      	mov	x0, x21
 4128110:      	bl	0x142fc <_ChromeMain+0xf060>
 4128114:      	ldr	x0, [x19, #0x358]
 4128118:      	and	x8, x0, #0xfffffffc00000000
 412811c:      	ldr	x9, [x23, #0x88]
 4128120:      	cmp	x8, x9
 4128124:      	b.ne	0x412812c <_ChromeMain+0x4122e90>
 4128128:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 412812c:      	str	x21, [x19, #0x358]
 4128130:      	mov	x0, x19
 4128134:      	mov	x1, x21
 4128138:      	bl	0x78aa440 <_ChromeMain+0x78a51a4>
 412813c:      	ldrb	w8, [x19, #0x369]
 4128140:      	cbz	w8, 0x4128200 <_ChromeMain+0x4122f64>
 4128144:      	ldr	x21, [x24]
 4128148:      	and	x8, x21, #0xfffffffc00000000
 412814c:      	ldr	x9, [x23, #0x88]
 4128150:      	cmp	x8, x9
 4128154:      	b.ne	0x4128160 <_ChromeMain+0x4122ec4>
 4128158:      	mov	x0, x21
 412815c:      	bl	0x142fc <_ChromeMain+0xf060>
 4128160:      	ldr	x22, [x19, #0x358]
 4128164:      	and	x24, x22, #0xfffffffc00000000
 4128168:      	ldr	x8, [x23, #0x88]
 412816c:      	cmp	x24, x8
 4128170:      	b.ne	0x412817c <_ChromeMain+0x4122ee0>
 4128174:      	mov	x0, x22
 4128178:      	bl	0x142fc <_ChromeMain+0xf060>
 412817c:      	mov	x0, x21
 4128180:      	mov	w1, #0x0                ; =0
 4128184:      	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 4128188:      	mov	x0, x21
 412818c:      	mov	w1, #0x0                ; =0
 4128190:      	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 4128194:      	ldr	x8, [x21]
 4128198:      	ldr	x8, [x8, #0xa0]
 412819c:      	mov	x0, x21
 41281a0:      	mov	w1, #0x0                ; =0
 41281a4:      	blr	x8
 41281a8:      	mov	x0, x22
 41281ac:      	mov	w1, #0x0                ; =0
 41281b0:      	bl	0xa6a60f4 <_ChromeMain+0xa6a0e58>
 41281b4:      	mov	x0, x22
 41281b8:      	mov	w1, #0x0                ; =0
 41281bc:      	bl	0xa6a6044 <_ChromeMain+0xa6a0da8>
 41281c0:      	ldr	x8, [x22]
 41281c4:      	ldr	x8, [x8, #0xa0]
 41281c8:      	mov	x0, x22
 41281cc:      	mov	w1, #0x0                ; =0
 41281d0:      	blr	x8
 41281d4:      	ldr	x8, [x23, #0x88]
 41281d8:      	cmp	x24, x8
 41281dc:      	b.ne	0x41281e8 <_ChromeMain+0x4122f4c>
 41281e0:      	mov	x0, x22
 41281e4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41281e8:      	and	x8, x21, #0xfffffffc00000000
 41281ec:      	ldr	x9, [x23, #0x88]
 41281f0:      	cmp	x8, x9
 41281f4:      	b.ne	0x4128200 <_ChromeMain+0x4122f64>
 41281f8:      	mov	x0, x21
 41281fc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4128200:      	and	x8, x19, #0xfffffffc00000000
 4128204:      	ldr	x9, [x23, #0x88]
 4128208:      	cmp	x8, x9
 412820c:      	b.ne	0x4128218 <_ChromeMain+0x4122f7c>
 4128210:      	mov	x0, x19
 4128214:      	bl	0x142fc <_ChromeMain+0xf060>
 4128218:      	mov	w0, #0x38               ; =56
 412821c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4128220:      	mov	w8, #0x1                ; =1
 4128224:      	str	w8, [x0]
 4128228:      	adrp	x8, 0x4ee3000 <_ChromeMain+0x4eddd64>
 412822c:      	add	x8, x8, #0x380
 4128230:      	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4128234:      	add	x9, x9, #0x600
 4128238:      	stp	x8, x9, [x0, #0x8]
 412823c:      	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 4128240:      	add	x22, x22, #0xb00
 4128244:      	adr	x8, 0x41277dc <_ChromeMain+0x4122540>
 4128248:      	nop
 412824c:      	stp	x22, x8, [x0, #0x18]
 4128250:      	stp	xzr, x19, [x0, #0x28]
 4128254:      	ldr	x21, [x20, #0x120]
 4128258:      	str	x0, [x20, #0x120]
 412825c:      	cbnz	x21, 0x41285a8 <_ChromeMain+0x412330c>
 4128260:      	and	x8, x19, #0xfffffffc00000000
 4128264:      	ldr	x9, [x23, #0x88]
 4128268:      	cmp	x8, x9
 412826c:      	b.ne	0x4128278 <_ChromeMain+0x4122fdc>
 4128270:      	mov	x0, x19
 4128274:      	bl	0x142fc <_ChromeMain+0xf060>
 4128278:      	mov	w0, #0x38               ; =56
 412827c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4128280:      	mov	w8, #0x1                ; =1
 4128284:      	str	w8, [x0]
 4128288:      	adrp	x8, 0x3f6d000 <_ChromeMain+0x3f67d64>
 412828c:      	add	x8, x8, #0x140
 4128290:      	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4128294:      	add	x9, x9, #0x600
 4128298:      	stp	x8, x9, [x0, #0x8]
 412829c:      	adr	x8, 0x4127a80 <_ChromeMain+0x41227e4>
 41282a0:      	nop
 41282a4:      	stp	x22, x8, [x0, #0x18]
 41282a8:      	stp	xzr, x19, [x0, #0x28]
 41282ac:      	ldr	x21, [x20, #0x128]
 41282b0:      	str	x0, [x20, #0x128]
 41282b4:      	cbnz	x21, 0x4128534 <_ChromeMain+0x4123298>
 41282b8:      	ldr	x21, [x19, #0x328]
 41282bc:      	and	x8, x19, #0xfffffffc00000000
 41282c0:      	ldr	x9, [x23, #0x88]
 41282c4:      	cmp	x8, x9
 41282c8:      	b.ne	0x41282d4 <_ChromeMain+0x4123038>
 41282cc:      	mov	x0, x19
 41282d0:      	bl	0x142fc <_ChromeMain+0xf060>
 41282d4:      	mov	w0, #0x38               ; =56
 41282d8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 41282dc:      	mov	x1, x0
 41282e0:      	mov	w8, #0x1                ; =1
 41282e4:      	str	w8, [x0]
 41282e8:      	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 41282ec:      	add	x8, x8, #0x9c0
 41282f0:      	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 41282f4:      	add	x9, x9, #0x600
 41282f8:      	stp	x8, x9, [x0, #0x8]
 41282fc:      	adrp	x8, 0x78aa000 <_ChromeMain+0x78a4d64>
 4128300:      	add	x8, x8, #0x7ac
 4128304:      	stp	x22, x8, [x0, #0x18]
 4128308:      	stp	xzr, x19, [x0, #0x28]
 412830c:      	add	x8, sp, #0x8
 4128310:      	add	x0, x21, #0x8
 4128314:      	bl	0x159d044 <_ChromeMain+0x1597da8>
 4128318:      	ldr	x8, [x19, #0x3a8]
 412831c:      	ldr	x9, [x19, #0x3b0]
 4128320:      	cmp	x8, x9
 4128324:      	b.ne	0x412845c <_ChromeMain+0x41231c0>
 4128328:      	add	x0, x19, #0x3a0
 412832c:      	add	x1, sp, #0x8
 4128330:      	bl	0x18bd640 <_ChromeMain+0x18b83a4>
 4128334:      	ldr	x8, [x19, #0x3a0]
 4128338:      	subs	x8, x0, x8
 412833c:      	asr	x8, x8, #3
 4128340:      	str	x8, [x19, #0x3a8]
 4128344:      	b.eq	0x4128638 <_ChromeMain+0x412339c>
 4128348:      	ldr	x21, [sp, #0x8]
 412834c:      	cbnz	x21, 0x4128494 <_ChromeMain+0x41231f8>
 4128350:      	and	x8, x19, #0xfffffffc00000000
 4128354:      	ldr	x9, [x23, #0x88]
 4128358:      	cmp	x8, x9
 412835c:      	b.ne	0x4128368 <_ChromeMain+0x41230cc>
 4128360:      	mov	x0, x19
 4128364:      	bl	0x142fc <_ChromeMain+0xf060>
 4128368:      	mov	w0, #0x38               ; =56
 412836c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4128370:      	mov	x1, x0
 4128374:      	mov	w8, #0x1                ; =1
 4128378:      	str	w8, [x0]
 412837c:      	adrp	x8, 0x3f6d000 <_ChromeMain+0x3f67d64>
 4128380:      	add	x8, x8, #0x140
 4128384:      	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4128388:      	add	x9, x9, #0x600
 412838c:      	stp	x8, x9, [x0, #0x8]
 4128390:      	adr	x8, 0x4127c34 <_ChromeMain+0x4122998>
 4128394:      	nop
 4128398:      	stp	x22, x8, [x0, #0x18]
 412839c:      	stp	xzr, x19, [x0, #0x28]
 41283a0:      	add	x8, sp, #0x8
 41283a4:      	add	x0, x20, #0x268
 41283a8:      	bl	0x789e4e4 <_ChromeMain+0x7899248>
 41283ac:      	ldr	x8, [x19, #0x3a8]
 41283b0:      	ldr	x9, [x19, #0x3b0]
 41283b4:      	cmp	x8, x9
 41283b8:      	b.ne	0x4128478 <_ChromeMain+0x41231dc>
 41283bc:      	add	x0, x19, #0x3a0
 41283c0:      	add	x1, sp, #0x8
 41283c4:      	bl	0x18bd640 <_ChromeMain+0x18b83a4>
 41283c8:      	ldr	x8, [x19, #0x3a0]
 41283cc:      	subs	x8, x0, x8
 41283d0:      	asr	x8, x8, #3
 41283d4:      	str	x8, [x19, #0x3a8]
 41283d8:      	b.eq	0x4128638 <_ChromeMain+0x412339c>
 41283dc:      	ldr	x20, [sp, #0x8]
 41283e0:      	cbnz	x20, 0x41284e4 <_ChromeMain+0x4123248>
 41283e4:      	mov	w8, #0x1                ; =1
 41283e8:      	strb	w8, [x19, #0x1cb]
 41283ec:      	ldr	x20, [x19, #0x350]
 41283f0:      	cbz	x20, 0x4128438 <_ChromeMain+0x412319c>
 41283f4:      	ldr	x0, [x19, #0x180]
 41283f8:      	cbz	x0, 0x412840c <_ChromeMain+0x4123170>
 41283fc:      	bl	0x87b6c8 <_ChromeMain+0x87642c>
 4128400:      	cbnz	w0, 0x412840c <_ChromeMain+0x4123170>
 4128404:      	mov	w8, #0x5f8              ; =1528
 4128408:      	b	0x4128410 <_ChromeMain+0x4123174>
 412840c:      	mov	w8, #0x5f7              ; =1527
 4128410:      	ldr	w9, [x20, #0x314]
 4128414:      	cmp	w9, w8
 4128418:      	b.eq	0x4128438 <_ChromeMain+0x412319c>
 412841c:      	str	w8, [x20, #0x314]
 4128420:      	mov	x0, x20
 4128424:      	mov	w1, #0x2                ; =2
 4128428:      	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 412842c:      	add	x0, x20, #0xf8
 4128430:      	add	x1, x20, #0x314
 4128434:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4128438:      	mov	x0, x19
 412843c:      	ldp	x29, x30, [sp, #0x60]
 4128440:      	ldp	x20, x19, [sp, #0x50]
 4128444:      	ldp	x22, x21, [sp, #0x40]
 4128448:      	ldp	x24, x23, [sp, #0x30]
 412844c:      	ldp	x26, x25, [sp, #0x20]
 4128450:      	ldp	x28, x27, [sp, #0x10]
 4128454:      	add	sp, sp, #0x70
 4128458:      	ret
 412845c:      	ldr	x9, [x19, #0x3a0]
 4128460:      	add	x0, x9, x8, lsl #3
 4128464:      	cbz	x0, 0x4128638 <_ChromeMain+0x412339c>
 4128468:      	ldr	x8, [sp, #0x8]
 412846c:      	str	x8, [x0], #0x8
 4128470:      	str	xzr, [sp, #0x8]
 4128474:      	b	0x4128334 <_ChromeMain+0x4123098>
 4128478:      	ldr	x9, [x19, #0x3a0]
 412847c:      	add	x0, x9, x8, lsl #3
 4128480:      	cbz	x0, 0x4128638 <_ChromeMain+0x412339c>
 4128484:      	ldr	x8, [sp, #0x8]
 4128488:      	str	x8, [x0], #0x8
 412848c:      	str	xzr, [sp, #0x8]
 4128490:      	b	0x41283c8 <_ChromeMain+0x412312c>
 4128494:      	str	xzr, [sp, #0x8]
 4128498:      	ldr	x8, [x21, #0x8]
 412849c:      	mov	x0, x21
 41284a0:      	blr	x8
 41284a4:      	mov	w8, #-0x1               ; =-1
 41284a8:      	ldaddal	w8, w8, [x21]
 41284ac:      	cmp	w8, #0x1
 41284b0:      	b.ne	0x41284c0 <_ChromeMain+0x4123224>
 41284b4:      	ldr	x8, [x21, #0x10]
 41284b8:      	mov	x0, x21
 41284bc:      	blr	x8
 41284c0:      	ldr	x0, [sp, #0x8]
 41284c4:      	cbz	x0, 0x4128350 <_ChromeMain+0x41230b4>
 41284c8:      	mov	w8, #-0x1               ; =-1
 41284cc:      	ldaddal	w8, w8, [x0]
 41284d0:      	cmp	w8, #0x1
 41284d4:      	b.ne	0x4128350 <_ChromeMain+0x41230b4>
 41284d8:      	ldr	x8, [x0, #0x10]
 41284dc:      	blr	x8
 41284e0:      	b	0x4128350 <_ChromeMain+0x41230b4>
 41284e4:      	str	xzr, [sp, #0x8]
 41284e8:      	ldr	x8, [x20, #0x8]
 41284ec:      	mov	x0, x20
 41284f0:      	blr	x8
 41284f4:      	mov	w8, #-0x1               ; =-1
 41284f8:      	ldaddal	w8, w8, [x20]
 41284fc:      	cmp	w8, #0x1
 4128500:      	b.ne	0x4128510 <_ChromeMain+0x4123274>
 4128504:      	ldr	x8, [x20, #0x10]
 4128508:      	mov	x0, x20
 412850c:      	blr	x8
 4128510:      	ldr	x0, [sp, #0x8]
 4128514:      	cbz	x0, 0x41283e4 <_ChromeMain+0x4123148>
 4128518:      	mov	w8, #-0x1               ; =-1
 412851c:      	ldaddal	w8, w8, [x0]
 4128520:      	cmp	w8, #0x1
 4128524:      	b.ne	0x41283e4 <_ChromeMain+0x4123148>
 4128528:      	ldr	x8, [x0, #0x10]
 412852c:      	blr	x8
 4128530:      	b	0x41283e4 <_ChromeMain+0x4123148>
 4128534:      	mov	w8, #-0x1               ; =-1
 4128538:      	ldaddal	w8, w8, [x21]
 412853c:      	cmp	w8, #0x1
 4128540:      	b.ne	0x41282b8 <_ChromeMain+0x412301c>
 4128544:      	ldr	x8, [x21, #0x10]
 4128548:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 412854c:      	add	x9, x9, #0x640
 4128550:      	cmp	x8, x9
 4128554:      	b.eq	0x412857c <_ChromeMain+0x41232e0>
 4128558:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 412855c:      	add	x9, x9, #0x600
 4128560:      	mov	x0, x21
 4128564:      	cmp	x8, x9
 4128568:      	b.eq	0x4128574 <_ChromeMain+0x41232d8>
 412856c:      	blr	x8
 4128570:      	b	0x41282b8 <_ChromeMain+0x412301c>
 4128574:      	mov	w1, #0x38               ; =56
 4128578:      	b	0x412858c <_ChromeMain+0x41232f0>
 412857c:      	ldr	x0, [x21, #0x30]
 4128580:      	cbnz	x0, 0x4128594 <_ChromeMain+0x41232f8>
 4128584:      	mov	x0, x21
 4128588:      	mov	w1, #0x48               ; =72
 412858c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128590:      	b	0x41282b8 <_ChromeMain+0x412301c>
 4128594:      	mov	w8, #-0x1               ; =-1
 4128598:      	ldaddal	w8, w8, [x0]
 412859c:      	cmp	w8, #0x1
 41285a0:      	b.eq	0x4128624 <_ChromeMain+0x4123388>
 41285a4:      	b	0x4128584 <_ChromeMain+0x41232e8>
 41285a8:      	mov	w8, #-0x1               ; =-1
 41285ac:      	ldaddal	w8, w8, [x21]
 41285b0:      	cmp	w8, #0x1
 41285b4:      	b.ne	0x4128260 <_ChromeMain+0x4122fc4>
 41285b8:      	ldr	x8, [x21, #0x10]
 41285bc:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 41285c0:      	add	x9, x9, #0x640
 41285c4:      	cmp	x8, x9
 41285c8:      	b.eq	0x41285f0 <_ChromeMain+0x4123354>
 41285cc:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 41285d0:      	add	x9, x9, #0x600
 41285d4:      	mov	x0, x21
 41285d8:      	cmp	x8, x9
 41285dc:      	b.eq	0x41285e8 <_ChromeMain+0x412334c>
 41285e0:      	blr	x8
 41285e4:      	b	0x4128260 <_ChromeMain+0x4122fc4>
 41285e8:      	mov	w1, #0x38               ; =56
 41285ec:      	b	0x4128600 <_ChromeMain+0x4123364>
 41285f0:      	ldr	x0, [x21, #0x30]
 41285f4:      	cbnz	x0, 0x4128608 <_ChromeMain+0x412336c>
 41285f8:      	mov	x0, x21
 41285fc:      	mov	w1, #0x48               ; =72
 4128600:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128604:      	b	0x4128260 <_ChromeMain+0x4122fc4>
 4128608:      	mov	w8, #-0x1               ; =-1
 412860c:      	ldaddal	w8, w8, [x0]
 4128610:      	cmp	w8, #0x1
 4128614:      	b.ne	0x41285f8 <_ChromeMain+0x412335c>
 4128618:      	mov	w1, #0x8                ; =8
 412861c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128620:      	b	0x41285f8 <_ChromeMain+0x412335c>
 4128624:      	mov	w1, #0x8                ; =8
 4128628:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 412862c:      	b	0x4128584 <_ChromeMain+0x41232e8>
 4128630:      	brk	#0
 4128634:      	hlt	#0
 4128638:      	brk	#0x1
 412863c:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4128640:      	b	0x4127fa4 <_ChromeMain+0x4122d08>
 4128644:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4128648:      	b	0x412801c <_ChromeMain+0x4122d80>
 412864c:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4128650:      	b	0x41280cc <_ChromeMain+0x4122e30>
 4128654:      	brk	#0
 4128658:      	hlt	#0
 412865c:      	brk	#0x1
 4128660:      	brk	#0
 4128664:      	hlt	#0
 4128668:      	brk	#0x1
 412866c:      	brk	#0
 4128670:      	hlt	#0
 4128674:      	brk	#0x1
 4128678:      	brk	#0
 412867c:      	hlt	#0
 4128680:      	brk	#0x1
 4128684:      	brk	#0
 4128688:      	hlt	#0
 412868c:      	brk	#0x1
 4128690:      	brk	#0
 4128694:      	hlt	#0
 4128698:      	brk	#0x1
 412869c:      	udf	#0x0
 41286a0:      	stp	x26, x25, [sp, #-0x50]!
 41286a4:      	stp	x24, x23, [sp, #0x10]
 41286a8:      	stp	x22, x21, [sp, #0x20]
 41286ac:      	stp	x20, x19, [sp, #0x30]
 41286b0:      	stp	x29, x30, [sp, #0x40]
 41286b4:      	add	x29, sp, #0x40
 41286b8:      	mov	x19, x0
 41286bc:      	str	xzr, [x0, #0x3d0]
 41286c0:      	ldr	x8, [x0, #0x3c8]
 41286c4:      	cbz	x8, 0x41286f0 <_ChromeMain+0x4123454>
 41286c8:      	mov	w9, #0x1                ; =1
 41286cc:      	stlurb	w9, [x8, #0x4]
 41286d0:      	ldr	x0, [x19, #0x3c8]
 41286d4:      	cbz	x0, 0x41286f0 <_ChromeMain+0x4123454>
 41286d8:      	mov	w8, #-0x1               ; =-1
 41286dc:      	ldaddal	w8, w8, [x0]
 41286e0:      	cmp	w8, #0x1
 41286e4:      	b.ne	0x41286f0 <_ChromeMain+0x4123454>
 41286e8:      	mov	w1, #0x8                ; =8
 41286ec:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41286f0:      	add	x0, x19, #0x3b8
 41286f4:      	bl	0x1043de8 <_ChromeMain+0x103eb4c>
 41286f8:      	ldr	x21, [x19, #0x3a0]
 41286fc:      	cbz	x21, 0x4128754 <_ChromeMain+0x41234b8>
 4128700:      	ldr	x8, [x19, #0x3a8]
 4128704:      	lsl	x9, x8, #3
 4128708:      	cbz	x9, 0x41289a8 <_ChromeMain+0x412370c>
 412870c:      	add	x9, x9, x21
 4128710:      	sub	x25, x9, #0x8
 4128714:      	neg	x22, x8, lsl #3
 4128718:      	mov	w23, #-0x1              ; =-1
 412871c:      	cbz	x25, 0x41289b0 <_ChromeMain+0x4123714>
 4128720:      	mov	x24, x25
 4128724:      	ldr	x20, [x24], #-0x8
 4128728:      	cbnz	x20, 0x41288b0 <_ChromeMain+0x4123614>
 412872c:      	mov	x25, x24
 4128730:      	adds	x22, x22, #0x8
 4128734:      	b.ne	0x412871c <_ChromeMain+0x4123480>
 4128738:      	ldr	x0, [x19, #0x3a0]
 412873c:      	sub	x8, x21, x0
 4128740:      	asr	x8, x8, #3
 4128744:      	str	x8, [x19, #0x3a8]
 4128748:      	ldr	x8, [x19, #0x3b0]
 412874c:      	lsl	x1, x8, #3
 4128750:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128754:      	ldr	x20, [x19, #0x398]
 4128758:      	cbnz	x20, 0x4128958 <_ChromeMain+0x41236bc>
 412875c:      	ldr	x20, [x19, #0x390]
 4128760:      	cbnz	x20, 0x4128908 <_ChromeMain+0x412366c>
 4128764:      	ldr	x0, [x19, #0x388]
 4128768:      	str	xzr, [x19, #0x388]
 412876c:      	cbnz	x0, 0x41288f8 <_ChromeMain+0x412365c>
 4128770:      	ldr	x0, [x19, #0x360]
 4128774:      	and	x8, x0, #0xfffffffc00000000
 4128778:      	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412877c:      	ldr	x9, [x20, #0x88]
 4128780:      	cmp	x8, x9
 4128784:      	b.ne	0x412878c <_ChromeMain+0x41234f0>
 4128788:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 412878c:      	str	xzr, [x19, #0x360]
 4128790:      	ldr	x0, [x19, #0x358]
 4128794:      	and	x8, x0, #0xfffffffc00000000
 4128798:      	ldr	x9, [x20, #0x88]
 412879c:      	cmp	x8, x9
 41287a0:      	b.ne	0x41287a8 <_ChromeMain+0x412350c>
 41287a4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41287a8:      	str	xzr, [x19, #0x358]
 41287ac:      	ldr	x0, [x19, #0x350]
 41287b0:      	and	x8, x0, #0xfffffffc00000000
 41287b4:      	ldr	x9, [x20, #0x88]
 41287b8:      	cmp	x8, x9
 41287bc:      	b.ne	0x41287c4 <_ChromeMain+0x4123528>
 41287c0:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41287c4:      	str	xzr, [x19, #0x350]
 41287c8:      	ldr	x0, [x19, #0x348]
 41287cc:      	and	x8, x0, #0xfffffffc00000000
 41287d0:      	ldr	x9, [x20, #0x88]
 41287d4:      	cmp	x8, x9
 41287d8:      	b.ne	0x41287e0 <_ChromeMain+0x4123544>
 41287dc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41287e0:      	str	xzr, [x19, #0x348]
 41287e4:      	ldr	x0, [x19, #0x340]
 41287e8:      	and	x8, x0, #0xfffffffc00000000
 41287ec:      	ldr	x9, [x20, #0x88]
 41287f0:      	cmp	x8, x9
 41287f4:      	b.ne	0x41287fc <_ChromeMain+0x4123560>
 41287f8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41287fc:      	str	xzr, [x19, #0x340]
 4128800:      	ldr	x0, [x19, #0x338]
 4128804:      	and	x8, x0, #0xfffffffc00000000
 4128808:      	ldr	x9, [x20, #0x88]
 412880c:      	cmp	x8, x9
 4128810:      	b.ne	0x4128818 <_ChromeMain+0x412357c>
 4128814:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4128818:      	str	xzr, [x19, #0x338]
 412881c:      	ldr	x0, [x19, #0x330]
 4128820:      	and	x8, x0, #0xfffffffc00000000
 4128824:      	ldr	x9, [x20, #0x88]
 4128828:      	cmp	x8, x9
 412882c:      	b.ne	0x4128834 <_ChromeMain+0x4123598>
 4128830:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4128834:      	str	xzr, [x19, #0x330]
 4128838:      	ldr	x0, [x19, #0x328]
 412883c:      	and	x8, x0, #0xfffffffc00000000
 4128840:      	ldr	x9, [x20, #0x88]
 4128844:      	cmp	x8, x9
 4128848:      	b.ne	0x4128850 <_ChromeMain+0x41235b4>
 412884c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4128850:      	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 4128854:      	add	x8, x8, #0xf08
 4128858:      	str	x8, [x19, #0x310]
 412885c:      	movi.2d	v0, #0000000000000000
 4128860:      	str	q0, [x19, #0x320]
 4128864:      	ldr	x8, [x19, #0x318]
 4128868:      	cbz	x8, 0x4128894 <_ChromeMain+0x41235f8>
 412886c:      	mov	w9, #0x1                ; =1
 4128870:      	stlurb	w9, [x8, #0x4]
 4128874:      	ldr	x0, [x19, #0x318]
 4128878:      	cbz	x0, 0x4128894 <_ChromeMain+0x41235f8>
 412887c:      	mov	w8, #-0x1               ; =-1
 4128880:      	ldaddal	w8, w8, [x0]
 4128884:      	cmp	w8, #0x1
 4128888:      	b.ne	0x4128894 <_ChromeMain+0x41235f8>
 412888c:      	mov	w1, #0x8                ; =8
 4128890:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128894:      	mov	x0, x19
 4128898:      	ldp	x29, x30, [sp, #0x40]
 412889c:      	ldp	x20, x19, [sp, #0x30]
 41288a0:      	ldp	x22, x21, [sp, #0x20]
 41288a4:      	ldp	x24, x23, [sp, #0x10]
 41288a8:      	ldp	x26, x25, [sp], #0x50
 41288ac:      	b	0x136f88c <_ChromeMain+0x136a5f0>
 41288b0:      	str	xzr, [x25]
 41288b4:      	ldr	x8, [x20, #0x8]
 41288b8:      	mov	x0, x20
 41288bc:      	blr	x8
 41288c0:      	ldaddal	w23, w8, [x20]
 41288c4:      	cmp	w8, #0x1
 41288c8:      	b.ne	0x41288d8 <_ChromeMain+0x412363c>
 41288cc:      	ldr	x8, [x20, #0x10]
 41288d0:      	mov	x0, x20
 41288d4:      	blr	x8
 41288d8:      	ldr	x0, [x25]
 41288dc:      	cbz	x0, 0x412872c <_ChromeMain+0x4123490>
 41288e0:      	ldaddal	w23, w8, [x0]
 41288e4:      	cmp	w8, #0x1
 41288e8:      	b.ne	0x412872c <_ChromeMain+0x4123490>
 41288ec:      	ldr	x8, [x0, #0x10]
 41288f0:      	blr	x8
 41288f4:      	b	0x412872c <_ChromeMain+0x4123490>
 41288f8:      	bl	0x78abe00 <_ChromeMain+0x78a6b64>
 41288fc:      	mov	w1, #0x40               ; =64
 4128900:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4128904:      	b	0x4128770 <_ChromeMain+0x41234d4>
 4128908:      	str	xzr, [x19, #0x390]
 412890c:      	ldr	x8, [x20, #0x8]
 4128910:      	mov	x0, x20
 4128914:      	blr	x8
 4128918:      	mov	w8, #-0x1               ; =-1
 412891c:      	ldaddal	w8, w8, [x20]
 4128920:      	cmp	w8, #0x1
 4128924:      	b.ne	0x4128934 <_ChromeMain+0x4123698>
 4128928:      	ldr	x8, [x20, #0x10]
 412892c:      	mov	x0, x20
 4128930:      	blr	x8
 4128934:      	ldr	x0, [x19, #0x390]
 4128938:      	cbz	x0, 0x4128764 <_ChromeMain+0x41234c8>
 412893c:      	mov	w8, #-0x1               ; =-1
 4128940:      	ldaddal	w8, w8, [x0]
 4128944:      	cmp	w8, #0x1
 4128948:      	b.ne	0x4128764 <_ChromeMain+0x41234c8>
 412894c:      	ldr	x8, [x0, #0x10]
 4128950:      	blr	x8
 4128954:      	b	0x4128764 <_ChromeMain+0x41234c8>
 4128958:      	str	xzr, [x19, #0x398]
 412895c:      	ldr	x8, [x20, #0x8]
 4128960:      	mov	x0, x20
 4128964:      	blr	x8
 4128968:      	mov	w8, #-0x1               ; =-1
 412896c:      	ldaddal	w8, w8, [x20]
 4128970:      	cmp	w8, #0x1
 4128974:      	b.ne	0x4128984 <_ChromeMain+0x41236e8>
 4128978:      	ldr	x8, [x20, #0x10]
 412897c:      	mov	x0, x20
 4128980:      	blr	x8
 4128984:      	ldr	x0, [x19, #0x398]
 4128988:      	cbz	x0, 0x412875c <_ChromeMain+0x41234c0>
 412898c:      	mov	w8, #-0x1               ; =-1
 4128990:      	ldaddal	w8, w8, [x0]
 4128994:      	cmp	w8, #0x1
 4128998:      	b.ne	0x412875c <_ChromeMain+0x41234c0>
 412899c:      	ldr	x8, [x0, #0x10]
 41289a0:      	blr	x8
 41289a4:      	b	0x412875c <_ChromeMain+0x41234c0>
 41289a8:      	mov	x0, x21
 41289ac:      	b	0x412873c <_ChromeMain+0x41234a0>
 41289b0:      	brk	#0x1
		...
 41289c0:      	sub	sp, sp, #0xa0
 41289c4:      	stp	d11, d10, [sp, #0x50]
 41289c8:      	stp	d9, d8, [sp, #0x60]
 41289cc:      	stp	x22, x21, [sp, #0x70]
 41289d0:      	stp	x20, x19, [sp, #0x80]
 41289d4:      	stp	x29, x30, [sp, #0x90]
 41289d8:      	add	x29, sp, #0x90
 41289dc:      	cbz	x1, 0x41289f4 <_ChromeMain+0x4123758>
 41289e0:      	mov	x21, x1
 41289e4:      	ldr	x8, [x1, #0x318]
 41289e8:      	cbz	x8, 0x41289f4 <_ChromeMain+0x4123758>
 41289ec:      	ldr	x19, [x21, #0x20]
 41289f0:      	cbnz	x19, 0x4128a10 <_ChromeMain+0x4123774>
 41289f4:      	ldp	x29, x30, [sp, #0x90]
 41289f8:      	ldp	x20, x19, [sp, #0x80]
 41289fc:      	ldp	x22, x21, [sp, #0x70]
 4128a00:      	ldp	d9, d8, [sp, #0x60]
 4128a04:      	ldp	d11, d10, [sp, #0x50]
 4128a08:      	add	sp, sp, #0xa0
 4128a0c:      	ret
 4128a10:      	mov	x0, x21
 4128a14:      	bl	0xa6a5e60 <_ChromeMain+0xa6a0bc4>
 4128a18:      	mov	x20, x1
 4128a1c:      	ldr	x8, [x21, #0x318]
 4128a20:      	ldr	w22, [x8, #0x1c0]
 4128a24:      	cmp	w20, #0x0
 4128a28:      	ccmp	w22, w20, #0x4, gt
 4128a2c:      	b.gt	0x4128a58 <_ChromeMain+0x41237bc>
 4128a30:      	bl	0x1e95060 <_ChromeMain+0x1e8fdc4>
 4128a34:      	mov	x1, x0
 4128a38:      	mov	x0, x19
 4128a3c:      	ldp	x29, x30, [sp, #0x90]
 4128a40:      	ldp	x20, x19, [sp, #0x80]
 4128a44:      	ldp	x22, x21, [sp, #0x70]
 4128a48:      	ldp	d9, d8, [sp, #0x60]
 4128a4c:      	ldp	d11, d10, [sp, #0x50]
 4128a50:      	add	sp, sp, #0xa0
 4128a54:      	b	0xa243390 <_ChromeMain+0xa23e0f4>
 4128a58:      	mov	x0, x21
 4128a5c:      	bl	0xa6a5ec8 <_ChromeMain+0xa6a0c2c>
 4128a60:      	mov.16b	v8, v0
 4128a64:      	sub	w8, w22, w20
 4128a68:      	bic	w8, w8, w8, asr #31
 4128a6c:      	ucvtf	s0, w8
 4128a70:      	fmov	s1, #-0.50000000
 4128a74:      	fadd	s9, s0, s1
 4128a78:      	fmov	s10, #0.50000000
 4128a7c:      	fcmp	s8, s10
 4128a80:      	b.gt	0x4128a8c <_ChromeMain+0x41237f0>
 4128a84:      	fcmp	s8, s9
 4128a88:      	b.pl	0x4128a30 <_ChromeMain+0x4123794>
 4128a8c:      	movi.2d	v0, #0000000000000000
 4128a90:      	stp	q0, q0, [sp, #0x30]
 4128a94:      	stp	q0, q0, [sp, #0x10]
 4128a98:      	str	q0, [sp]
 4128a9c:      	mov	x21, sp
 4128aa0:      	mov	x0, sp
 4128aa4:      	bl	0x9f8390 <_ChromeMain+0x9f30f4>
 4128aa8:      	strh	wzr, [sp]
 4128aac:      	fcmp	s8, s10
 4128ab0:      	csetm	w9, le
 4128ab4:      	ldr	x10, [sp, #0x8]
 4128ab8:      	cmp	x10, #0x8
 4128abc:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128ac0:      	add	x8, x21, #0x10
 4128ac4:      	lsl	x10, x10, #3
 4128ac8:      	str	wzr, [x8, x10]
 4128acc:      	ldr	x10, [sp, #0x8]
 4128ad0:      	add	x11, x10, #0x1
 4128ad4:      	str	x11, [sp, #0x8]
 4128ad8:      	cmp	x10, #0x8
 4128adc:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128ae0:      	add	x10, x8, x10, lsl #3
 4128ae4:      	ucvtf	s0, w20
 4128ae8:      	strb	w9, [x10, #0x4]
 4128aec:      	fmov	s1, #24.00000000
 4128af0:      	fdiv	s2, s1, s0
 4128af4:      	fmov	s1, #0.50000000
 4128af8:      	fcmp	s2, s1
 4128afc:      	fcsel	s2, s1, s2, gt
 4128b00:      	fmov	s3, #-24.00000000
 4128b04:      	fadd	s3, s0, s3
 4128b08:      	fdiv	s0, s3, s0
 4128b0c:      	fcmp	s0, s1
 4128b10:      	fcsel	s0, s1, s0, mi
 4128b14:      	fcmp	s2, s0
 4128b18:      	b.pl	0x4128b54 <_ChromeMain+0x41238b8>
 4128b1c:      	ldr	x9, [sp, #0x8]
 4128b20:      	cmp	x9, #0x8
 4128b24:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128b28:      	lsl	x9, x9, #3
 4128b2c:      	str	s2, [x8, x9]
 4128b30:      	ldr	x9, [sp, #0x8]
 4128b34:      	add	x10, x9, #0x1
 4128b38:      	str	x10, [sp, #0x8]
 4128b3c:      	cmp	x9, #0x8
 4128b40:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128b44:      	add	x9, x8, x9, lsl #3
 4128b48:      	mov	w10, #0xff              ; =255
 4128b4c:      	strb	w10, [x9, #0x4]
 4128b50:      	mov.16b	v1, v0
 4128b54:      	ldr	x9, [sp, #0x8]
 4128b58:      	cmp	x9, #0x8
 4128b5c:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128b60:      	lsl	x9, x9, #3
 4128b64:      	str	s1, [x8, x9]
 4128b68:      	ldr	x9, [sp, #0x8]
 4128b6c:      	add	x10, x9, #0x1
 4128b70:      	str	x10, [sp, #0x8]
 4128b74:      	cmp	x9, #0x8
 4128b78:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128b7c:      	add	x9, x8, x9, lsl #3
 4128b80:      	mov	w10, #0xff              ; =255
 4128b84:      	strb	w10, [x9, #0x4]
 4128b88:      	fcmp	s8, s9
 4128b8c:      	csetm	w9, pl
 4128b90:      	ldr	x10, [sp, #0x8]
 4128b94:      	cmp	x10, #0x8
 4128b98:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128b9c:      	lsl	x10, x10, #3
 4128ba0:      	mov	w11, #0x3f800000        ; =1065353216
 4128ba4:      	str	w11, [x8, x10]
 4128ba8:      	ldr	x10, [sp, #0x8]
 4128bac:      	add	x11, x10, #0x1
 4128bb0:      	str	x11, [sp, #0x8]
 4128bb4:      	cmp	x10, #0x8
 4128bb8:      	b.hs	0x4128d08 <_ChromeMain+0x4123a6c>
 4128bbc:      	add	x8, x8, x10, lsl #3
 4128bc0:      	strb	w9, [x8, #0x4]
 4128bc4:      	ldr	x8, [x19, #0x168]
 4128bc8:      	ldr	x8, [x8, #0x20]
 4128bcc:      	cbz	x8, 0x4128d00 <_ChromeMain+0x4123a64>
 4128bd0:      	add	x0, x8, #0x158
 4128bd4:      	ldrh	w8, [x0]
 4128bd8:      	ldrh	w9, [sp]
 4128bdc:      	cmp	w8, w9
 4128be0:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128be4:      	ldr	x8, [x0, #0x8]
 4128be8:      	ldr	x9, [sp, #0x8]
 4128bec:      	cmp	x8, x9
 4128bf0:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128bf4:      	ldr	s0, [x0, #0x10]
 4128bf8:      	ldr	s1, [sp, #0x10]
 4128bfc:      	ldrb	w8, [x0, #0x14]
 4128c00:      	ldrb	w9, [sp, #0x14]
 4128c04:      	fcmp	s0, s1
 4128c08:      	ccmp	w8, w9, #0x0, eq
 4128c0c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c10:      	ldr	s0, [x0, #0x18]
 4128c14:      	ldr	s1, [sp, #0x18]
 4128c18:      	fcmp	s0, s1
 4128c1c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c20:      	ldrb	w8, [x0, #0x1c]
 4128c24:      	ldrb	w9, [sp, #0x1c]
 4128c28:      	cmp	w8, w9
 4128c2c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c30:      	ldr	s0, [x0, #0x20]
 4128c34:      	ldr	s1, [sp, #0x20]
 4128c38:      	fcmp	s0, s1
 4128c3c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c40:      	ldrb	w8, [x0, #0x24]
 4128c44:      	ldrb	w9, [sp, #0x24]
 4128c48:      	cmp	w8, w9
 4128c4c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c50:      	ldr	s0, [x0, #0x28]
 4128c54:      	ldr	s1, [sp, #0x28]
 4128c58:      	fcmp	s0, s1
 4128c5c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c60:      	ldrb	w8, [x0, #0x2c]
 4128c64:      	ldrb	w9, [sp, #0x2c]
 4128c68:      	cmp	w8, w9
 4128c6c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c70:      	ldr	s0, [x0, #0x30]
 4128c74:      	ldr	s1, [sp, #0x30]
 4128c78:      	fcmp	s0, s1
 4128c7c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c80:      	ldrb	w8, [x0, #0x34]
 4128c84:      	ldrb	w9, [sp, #0x34]
 4128c88:      	cmp	w8, w9
 4128c8c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128c90:      	ldr	s0, [x0, #0x38]
 4128c94:      	ldr	s1, [sp, #0x38]
 4128c98:      	fcmp	s0, s1
 4128c9c:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128ca0:      	ldrb	w8, [x0, #0x3c]
 4128ca4:      	ldrb	w9, [sp, #0x3c]
 4128ca8:      	cmp	w8, w9
 4128cac:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128cb0:      	ldr	s0, [x0, #0x40]
 4128cb4:      	ldr	s1, [sp, #0x40]
 4128cb8:      	fcmp	s0, s1
 4128cbc:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128cc0:      	ldrb	w8, [x0, #0x44]
 4128cc4:      	ldrb	w9, [sp, #0x44]
 4128cc8:      	cmp	w8, w9
 4128ccc:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128cd0:      	ldr	s0, [x0, #0x48]
 4128cd4:      	ldr	s1, [sp, #0x48]
 4128cd8:      	fcmp	s0, s1
 4128cdc:      	b.ne	0x4128cf0 <_ChromeMain+0x4123a54>
 4128ce0:      	ldrb	w8, [x0, #0x4c]
 4128ce4:      	ldrb	w9, [sp, #0x4c]
 4128ce8:      	cmp	w8, w9
 4128cec:      	b.eq	0x41289f4 <_ChromeMain+0x4123758>
 4128cf0:      	mov	x1, sp
 4128cf4:      	mov	x0, x19
 4128cf8:      	bl	0xa243390 <_ChromeMain+0xa23e0f4>
 4128cfc:      	b	0x41289f4 <_ChromeMain+0x4123758>
 4128d00:      	bl	0x1e95060 <_ChromeMain+0x1e8fdc4>
 4128d04:      	b	0x4128bd4 <_ChromeMain+0x4123938>
 4128d08:      	brk	#0x1
		...
 4128d40:      	sub	sp, sp, #0x60
 4128d44:      	stp	x22, x21, [sp, #0x30]
 4128d48:      	stp	x20, x19, [sp, #0x40]
 4128d4c:      	stp	x29, x30, [sp, #0x50]
 4128d50:      	add	x29, sp, #0x50
 4128d54:      	mov	x19, x8
 4128d58:      	cbz	x0, 0x4128d68 <_ChromeMain+0x4123acc>
 4128d5c:      	mov	x21, x0
 4128d60:      	ldrb	w8, [x0, #0x1c8]
 4128d64:      	tbnz	w8, #0x0, 0x4128d84 <_ChromeMain+0x4123ae8>
 4128d68:      	strb	wzr, [x19]
 4128d6c:      	strb	wzr, [x19, #0x10]
 4128d70:      	ldp	x29, x30, [sp, #0x50]
 4128d74:      	ldp	x20, x19, [sp, #0x40]
 4128d78:      	ldp	x22, x21, [sp, #0x30]
 4128d7c:      	add	sp, sp, #0x60
 4128d80:      	ret
 4128d84:      	mov	x20, x1
 4128d88:      	ldr	x8, [x21]
 4128d8c:      	ldr	x8, [x8, #0x58]
 4128d90:      	mov	x0, x21
 4128d94:      	blr	x8
 4128d98:      	mov	x22, x0
 4128d9c:      	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 4128da0:      	cmp	x22, #0x0
 4128da4:      	cset	w8, ne
 4128da8:      	cmp	x22, x0
 4128dac:      	ccmp	x22, #0x0, #0x4, ne
 4128db0:      	b.eq	0x4128dc8 <_ChromeMain+0x4123b2c>
 4128db4:      	ldr	x22, [x22, #0x48]
 4128db8:      	cmp	x22, #0x0
 4128dbc:      	cset	w8, ne
 4128dc0:      	ccmp	x22, x0, #0x4, ne
 4128dc4:      	b.ne	0x4128db4 <_ChromeMain+0x4123b18>
 4128dc8:      	cbz	w8, 0x4128e24 <_ChromeMain+0x4123b88>
 4128dcc:      	ldr	x8, [x21, #0x1c0]
 4128dd0:      	stp	xzr, x8, [sp, #0x20]
 4128dd4:      	add	x2, sp, #0x20
 4128dd8:      	mov	x0, x21
 4128ddc:      	mov	x1, x20
 4128de0:      	bl	0x1426944 <_ChromeMain+0x14216a8>
 4128de4:      	mov	x20, x1
 4128de8:      	stp	x0, x1, [sp, #0x8]
 4128dec:      	bl	0x270cfc0 <_ChromeMain+0x2707d24>
 4128df0:      	mov	w8, #0xf                ; =15
 4128df4:      	cmp	w20, #0xf
 4128df8:      	csel	w8, w20, w8, lt
 4128dfc:      	lsl	x8, x8, #32
