
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4128e00:      	stp	xzr, x8, [sp, #0x20]
 4128e04:      	add	x0, sp, #0x8
 4128e08:      	add	x1, sp, #0x20
 4128e0c:      	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 4128e10:      	ldur	q0, [sp, #0x8]
 4128e14:      	str	q0, [x19]
 4128e18:      	mov	w8, #0x1                ; =1
 4128e1c:      	strb	w8, [x19, #0x10]
 4128e20:      	b	0x4128d70 <_ChromeMain+0x4123ad4>
 4128e24:      	ldr	x8, [x21]
 4128e28:      	ldr	x8, [x8, #0x58]
 4128e2c:      	mov	x0, x21
 4128e30:      	blr	x8
 4128e34:      	mov	x22, x0
 4128e38:      	bl	0x78a6ab8 <_ChromeMain+0x78a181c>
 4128e3c:      	cmp	x22, #0x0
 4128e40:      	cset	w8, ne
 4128e44:      	cmp	x22, x0
 4128e48:      	ccmp	x22, #0x0, #0x4, ne
 4128e4c:      	b.eq	0x4128e64 <_ChromeMain+0x4123bc8>
 4128e50:      	ldr	x22, [x22, #0x48]
 4128e54:      	cmp	x22, #0x0
 4128e58:      	cset	w8, ne
 4128e5c:      	ccmp	x22, x0, #0x4, ne
 4128e60:      	b.ne	0x4128e50 <_ChromeMain+0x4123bb4>
 4128e64:      	cbz	w8, 0x4128e8c <_ChromeMain+0x4123bf0>
 4128e68:      	mov	x0, x21
 4128e6c:      	bl	0x411de84 <_ChromeMain+0x4118be8>
 4128e70:      	stp	x0, x1, [sp, #0x8]
 4128e74:      	add	x2, sp, #0x8
 4128e78:      	mov	x0, x21
 4128e7c:      	mov	x1, x20
 4128e80:      	bl	0x1426944 <_ChromeMain+0x14216a8>
 4128e84:      	stp	x0, x1, [x19]
 4128e88:      	b	0x4128e18 <_ChromeMain+0x4123b7c>
 4128e8c:      	stp	xzr, xzr, [x19]
 4128e90:      	str	wzr, [x19, #0x10]
 4128e94:      	ldr	x8, [x21, #0x198]
 4128e98:      	lsl	x22, x8, #3
 4128e9c:      	cbz	x22, 0x4128d70 <_ChromeMain+0x4123ad4>
 4128ea0:      	ldr	x21, [x21, #0x190]
 4128ea4:      	b	0x4128ec4 <_ChromeMain+0x4123c28>
 4128ea8:      	ldur	q0, [sp, #0x8]
 4128eac:      	str	q0, [x19]
 4128eb0:      	ldrb	w8, [sp, #0x18]
 4128eb4:      	strb	w8, [x19, #0x10]
 4128eb8:      	add	x21, x21, #0x8
 4128ebc:      	subs	x22, x22, #0x8
 4128ec0:      	b.eq	0x4128d70 <_ChromeMain+0x4123ad4>
 4128ec4:      	ldr	x0, [x21]
 4128ec8:      	stp	xzr, xzr, [sp, #0x8]
 4128ecc:      	str	wzr, [sp, #0x18]
 4128ed0:      	add	x8, sp, #0x8
 4128ed4:      	mov	x1, x20
 4128ed8:      	bl	0x4128d40 <_ChromeMain+0x4123aa4>
 4128edc:      	ldrb	w8, [sp, #0x18]
 4128ee0:      	tbz	w8, #0x0, 0x4128eb8 <_ChromeMain+0x4123c1c>
 4128ee4:      	ldrb	w8, [x19, #0x10]
 4128ee8:      	cbz	w8, 0x4128ea8 <_ChromeMain+0x4123c0c>
 4128eec:      	ldr	w8, [sp, #0x8]
 4128ef0:      	ldr	w9, [sp, #0x10]
 4128ef4:      	add	w8, w9, w8
 4128ef8:      	ldr	w9, [x19]
 4128efc:      	ldr	w10, [x19, #0x8]
 4128f00:      	add	w9, w10, w9
 4128f04:      	cmp	w8, w9
 4128f08:      	b.le	0x4128eb8 <_ChromeMain+0x4123c1c>
 4128f0c:      	b	0x4128ea8 <_ChromeMain+0x4123c0c>
 4128f10:      	ldr	x8, [x0, #0x328]
 4128f14:      	cbz	x8, 0x4128f30 <_ChromeMain+0x4123c94>
 4128f18:      	ldr	x8, [x8, #0x148]
 4128f1c:      	ldr	x0, [x8, #0x38]
 4128f20:      	cbz	x0, 0x4128f30 <_ChromeMain+0x4123c94>
 4128f24:      	mov	x1, #0x0                ; =0
 4128f28:      	mov	w2, #0x6                ; =6
 4128f2c:      	b	0x27643c0 <_ChromeMain+0x275f124>
 4128f30:      	ret
 4128f34:      	ldr	x8, [x0, #0x18]
 4128f38:      	cbz	x8, 0x4128f54 <_ChromeMain+0x4123cb8>
 4128f3c:      	ldr	x8, [x8, #0x148]
 4128f40:      	ldr	x0, [x8, #0x38]
 4128f44:      	cbz	x0, 0x4128f54 <_ChromeMain+0x4123cb8>
 4128f48:      	mov	x1, #0x0                ; =0
 4128f4c:      	mov	w2, #0x6                ; =6
 4128f50:      	b	0x27643c0 <_ChromeMain+0x275f124>
 4128f54:      	ret
 4128f58:      	sub	sp, sp, #0x30
 4128f5c:      	stp	x20, x19, [sp, #0x10]
 4128f60:      	stp	x29, x30, [sp, #0x20]
 4128f64:      	add	x29, sp, #0x20
 4128f68:      	cbz	x1, 0x4128fa8 <_ChromeMain+0x4123d0c>
 4128f6c:      	mov	x19, x0
 4128f70:      	ldr	x0, [x0, #0x328]
 4128f74:      	cbz	x0, 0x4128fa8 <_ChromeMain+0x4123d0c>
 4128f78:      	ldr	x8, [x0, #0x148]
 4128f7c:      	ldr	x9, [x8, #0x30]
 4128f80:      	cbz	x9, 0x4128ff0 <_ChromeMain+0x4123d54>
 4128f84:      	ldr	x8, [x9, #0x338]
 4128f88:      	cbz	x8, 0x4128fb8 <_ChromeMain+0x4123d1c>
 4128f8c:      	ldr	x10, [x8, #0x40]
 4128f90:      	add	x9, x9, #0x8
 4128f94:      	cmp	x10, x9
 4128f98:      	b.ne	0x4128fb8 <_ChromeMain+0x4123d1c>
 4128f9c:      	ldr	w8, [x8, #0x20]
 4128fa0:      	cmp	w8, #0x6
 4128fa4:      	b.eq	0x4128fb8 <_ChromeMain+0x4123d1c>
 4128fa8:      	ldp	x29, x30, [sp, #0x20]
 4128fac:      	ldp	x20, x19, [sp, #0x10]
 4128fb0:      	add	sp, sp, #0x30
 4128fb4:      	ret
 4128fb8:      	ldr	w8, [x1, #0x10]
 4128fbc:      	str	w8, [sp, #0x8]
 4128fc0:      	mov	w8, #0x1                ; =1
 4128fc4:      	strb	w8, [sp, #0xc]
 4128fc8:      	add	x1, sp, #0x8
 4128fcc:      	bl	0x78a32c0 <_ChromeMain+0x789e024>
 4128fd0:      	cbz	x0, 0x4128ffc <_ChromeMain+0x4123d60>
 4128fd4:      	ldr	x1, [x0, #0x140]
 4128fd8:      	mov	x0, x19
 4128fdc:      	mov	x2, #0x0                ; =0
 4128fe0:      	ldp	x29, x30, [sp, #0x20]
 4128fe4:      	ldp	x20, x19, [sp, #0x10]
 4128fe8:      	add	sp, sp, #0x30
 4128fec:      	b	0x4129008 <_ChromeMain+0x4123d6c>
 4128ff0:      	brk	#0
 4128ff4:      	hlt	#0
 4128ff8:      	brk	#0x1
 4128ffc:      	brk	#0
 4129000:      	hlt	#0
 4129004:      	brk	#0x1
 4129008:      	stp	x26, x25, [sp, #-0x50]!
 412900c:      	stp	x24, x23, [sp, #0x10]
 4129010:      	stp	x22, x21, [sp, #0x20]
 4129014:      	stp	x20, x19, [sp, #0x30]
 4129018:      	stp	x29, x30, [sp, #0x40]
 412901c:      	add	x29, sp, #0x40
 4129020:      	mov	x20, x2
 4129024:      	mov	x21, x1
 4129028:      	mov	x19, x0
 412902c:      	cbz	x1, 0x4129040 <_ChromeMain+0x4123da4>
 4129030:      	ldr	x8, [x19, #0x338]
 4129034:      	cbz	x8, 0x412919c <_ChromeMain+0x4123f00>
 4129038:      	cmp	x21, x8
 412903c:      	b.ne	0x4129184 <_ChromeMain+0x4123ee8>
 4129040:      	cbz	x20, 0x4129168 <_ChromeMain+0x4123ecc>
 4129044:      	ldr	x8, [x19, #0x338]
 4129048:      	cbz	x8, 0x4129140 <_ChromeMain+0x4123ea4>
 412904c:      	cmp	x20, x8
 4129050:      	b.ne	0x4129128 <_ChromeMain+0x4123e8c>
 4129054:      	cmp	x21, #0x0
 4129058:      	cset	w26, ne
 412905c:      	mov	w25, #0x1               ; =1
 4129060:      	ldr	x8, [x19, #0x388]
 4129064:      	ldr	x9, [x8, #0x30]
 4129068:      	cmp	x9, #0x100, lsl #12     ; =0x100000
 412906c:      	b.lo	0x4129094 <_ChromeMain+0x4123df8>
 4129070:      	ldrb	w9, [x19, #0x369]
 4129074:      	cbnz	w9, 0x4129270 <_ChromeMain+0x4123fd4>
 4129078:      	ldr	x1, [x19, #0x330]
 412907c:      	mov	x0, x19
 4129080:      	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 4129084:      	ldr	x23, [x19, #0x358]
 4129088:      	mov	x0, x19
 412908c:      	mov	x1, x23
 4129090:      	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 4129094:      	ldr	x0, [x19, #0x388]
 4129098:      	mov	x1, x21
 412909c:      	mov	x2, x20
 41290a0:      	bl	0x78aaf94 <_ChromeMain+0x78a5cf8>
 41290a4:      	ldrb	w8, [x19, #0x369]
 41290a8:      	cbz	w8, 0x41291cc <_ChromeMain+0x4123f30>
 41290ac:      	cbz	x21, 0x41290c8 <_ChromeMain+0x4123e2c>
 41290b0:      	mov	x22, x21
 41290b4:      	mov	x0, x22
 41290b8:      	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 41290bc:      	cbnz	x0, 0x4129110 <_ChromeMain+0x4123e74>
 41290c0:      	ldr	x22, [x22, #0x188]
 41290c4:      	cbnz	x22, 0x41290b4 <_ChromeMain+0x4123e18>
 41290c8:      	mov	x23, #0x0               ; =0
 41290cc:      	cbz	x20, 0x41290e8 <_ChromeMain+0x4123e4c>
 41290d0:      	mov	x24, x20
 41290d4:      	mov	x0, x24
 41290d8:      	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 41290dc:      	cbnz	x0, 0x412911c <_ChromeMain+0x4123e80>
 41290e0:      	ldr	x24, [x24, #0x188]
 41290e4:      	cbnz	x24, 0x41290d4 <_ChromeMain+0x4123e38>
 41290e8:      	mov	x22, #0x0               ; =0
 41290ec:      	cbz	x21, 0x41290f4 <_ChromeMain+0x4123e58>
 41290f0:      	cbz	x23, 0x41292f8 <_ChromeMain+0x412405c>
 41290f4:      	cbz	x20, 0x41290fc <_ChromeMain+0x4123e60>
 41290f8:      	cbz	x22, 0x41292e8 <_ChromeMain+0x412404c>
 41290fc:      	cbnz	x23, 0x4129404 <_ChromeMain+0x4124168>
 4129100:      	cmp	x22, #0x0
 4129104:      	ccmp	x22, x23, #0x4, ne
 4129108:      	b.eq	0x412916c <_ChromeMain+0x4123ed0>
 412910c:      	b	0x412930c <_ChromeMain+0x4124070>
 4129110:      	mov	x23, x0
 4129114:      	cbz	x20, 0x41290e8 <_ChromeMain+0x4123e4c>
 4129118:      	b	0x41290d0 <_ChromeMain+0x4123e34>
 412911c:      	mov	x22, x0
 4129120:      	cbz	x21, 0x41290f4 <_ChromeMain+0x4123e58>
 4129124:      	b	0x41290f0 <_ChromeMain+0x4123e54>
 4129128:      	mov	x9, x20
 412912c:      	ldr	x9, [x9, #0x188]
 4129130:      	cmp	x9, x8
 4129134:      	ccmp	x9, #0x0, #0x4, ne
 4129138:      	b.ne	0x412912c <_ChromeMain+0x4123e90>
 412913c:      	cbnz	x9, 0x4129054 <_ChromeMain+0x4123db8>
 4129140:      	ldr	x8, [x19, #0x360]
 4129144:      	cbz	x8, 0x4129168 <_ChromeMain+0x4123ecc>
 4129148:      	cmp	x20, x8
 412914c:      	b.eq	0x4129054 <_ChromeMain+0x4123db8>
 4129150:      	mov	x9, x20
 4129154:      	ldr	x9, [x9, #0x188]
 4129158:      	cmp	x9, x8
 412915c:      	ccmp	x9, #0x0, #0x4, ne
 4129160:      	b.ne	0x4129154 <_ChromeMain+0x4123eb8>
 4129164:      	cbnz	x9, 0x4129054 <_ChromeMain+0x4123db8>
 4129168:      	cbnz	x21, 0x41291e4 <_ChromeMain+0x4123f48>
 412916c:      	ldp	x29, x30, [sp, #0x40]
 4129170:      	ldp	x20, x19, [sp, #0x30]
 4129174:      	ldp	x22, x21, [sp, #0x20]
 4129178:      	ldp	x24, x23, [sp, #0x10]
 412917c:      	ldp	x26, x25, [sp], #0x50
 4129180:      	ret
 4129184:      	mov	x9, x21
 4129188:      	ldr	x9, [x9, #0x188]
 412918c:      	cmp	x9, x8
 4129190:      	ccmp	x9, #0x0, #0x4, ne
 4129194:      	b.ne	0x4129188 <_ChromeMain+0x4123eec>
 4129198:      	cbnz	x9, 0x4129040 <_ChromeMain+0x4123da4>
 412919c:      	ldr	x8, [x19, #0x360]
 41291a0:      	cbz	x8, 0x41291c4 <_ChromeMain+0x4123f28>
 41291a4:      	cmp	x21, x8
 41291a8:      	b.eq	0x4129040 <_ChromeMain+0x4123da4>
 41291ac:      	mov	x9, x21
 41291b0:      	ldr	x9, [x9, #0x188]
 41291b4:      	cmp	x9, x8
 41291b8:      	ccmp	x9, #0x0, #0x4, ne
 41291bc:      	b.ne	0x41291b0 <_ChromeMain+0x4123f14>
 41291c0:      	cbnz	x9, 0x4129040 <_ChromeMain+0x4123da4>
 41291c4:      	mov	x21, #0x0               ; =0
 41291c8:      	b	0x4129040 <_ChromeMain+0x4123da4>
 41291cc:      	cbnz	w26, 0x41291fc <_ChromeMain+0x4123f60>
 41291d0:      	cbz	w25, 0x412916c <_ChromeMain+0x4123ed0>
 41291d4:      	mov	w10, #0x0               ; =0
 41291d8:      	mov	w8, #0x0                ; =0
 41291dc:      	ldr	x9, [x19, #0x338]
 41291e0:      	b	0x412921c <_ChromeMain+0x4123f80>
 41291e4:      	mov	w25, #0x0               ; =0
 41291e8:      	mov	x20, #0x0               ; =0
 41291ec:      	mov	w26, #0x1               ; =1
 41291f0:      	b	0x4129060 <_ChromeMain+0x4123dc4>
 41291f4:      	ldr	x21, [x21, #0x188]
 41291f8:      	b	0x4129200 <_ChromeMain+0x4123f64>
 41291fc:      	ldr	x9, [x19, #0x338]
 4129200:      	cmp	x21, #0x0
 4129204:      	cset	w8, ne
 4129208:      	cmp	x21, x9
 412920c:      	ccmp	x21, #0x0, #0x4, ne
 4129210:      	b.ne	0x41291f4 <_ChromeMain+0x4123f58>
 4129214:      	tbz	w25, #0x0, 0x4129388 <_ChromeMain+0x41240ec>
 4129218:      	eor	w10, w8, #0x1
 412921c:      	cmp	x20, #0x0
 4129220:      	cset	w11, ne
 4129224:      	cmp	x20, x9
 4129228:      	ccmp	x20, #0x0, #0x4, ne
 412922c:      	b.ne	0x4129268 <_ChromeMain+0x4123fcc>
 4129230:      	eor	w9, w11, #0x1
 4129234:      	orr	w21, w10, w9
 4129238:      	orr	w8, w8, w11
 412923c:      	tbnz	w8, #0x0, 0x4129390 <_ChromeMain+0x41240f4>
 4129240:      	cbz	w21, 0x412916c <_ChromeMain+0x4123ed0>
 4129244:      	ldr	x22, [x19, #0x358]
 4129248:      	ldr	x20, [x19, #0x3c8]
 412924c:      	cbz	x20, 0x4129328 <_ChromeMain+0x412408c>
 4129250:      	mov	w8, #0x1                ; =1
 4129254:      	ldadd	w8, w8, [x20]
 4129258:      	mov	w9, #0x7fffffff         ; =2147483647
 412925c:      	cmp	w8, w9
 4129260:      	b.eq	0x4129488 <_ChromeMain+0x41241ec>
 4129264:      	b	0x4129328 <_ChromeMain+0x412408c>
 4129268:      	ldr	x20, [x20, #0x188]
 412926c:      	b	0x412921c <_ChromeMain+0x4123f80>
 4129270:      	ldr	x23, [x8, #0x10]
 4129274:      	cbz	x23, 0x4129298 <_ChromeMain+0x4123ffc>
 4129278:      	mov	x0, x23
 412927c:      	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 4129280:      	mov	x22, x0
 4129284:      	cbnz	x0, 0x4129290 <_ChromeMain+0x4123ff4>
 4129288:      	ldr	x23, [x23, #0x188]
 412928c:      	cbnz	x23, 0x4129278 <_ChromeMain+0x4123fdc>
 4129290:      	ldr	x8, [x19, #0x388]
 4129294:      	b	0x412929c <_ChromeMain+0x4124000>
 4129298:      	mov	x22, #0x0               ; =0
 412929c:      	ldr	x24, [x8, #0x18]
 41292a0:      	cbz	x24, 0x41292b8 <_ChromeMain+0x412401c>
 41292a4:      	mov	x0, x24
 41292a8:      	bl	0x3161a40 <_ChromeMain+0x315c7a4>
 41292ac:      	cbnz	x0, 0x41292dc <_ChromeMain+0x4124040>
 41292b0:      	ldr	x24, [x24, #0x188]
 41292b4:      	cbnz	x24, 0x41292a4 <_ChromeMain+0x4124008>
 41292b8:      	mov	x23, #0x0               ; =0
 41292bc:      	cbz	x22, 0x41292cc <_ChromeMain+0x4124030>
 41292c0:      	mov	x0, x19
 41292c4:      	mov	x1, x22
 41292c8:      	bl	0x78aae3c <_ChromeMain+0x78a5ba0>
 41292cc:      	cbz	x23, 0x4129094 <_ChromeMain+0x4123df8>
 41292d0:      	cmp	x23, x22
 41292d4:      	b.ne	0x4129088 <_ChromeMain+0x4123dec>
 41292d8:      	b	0x4129094 <_ChromeMain+0x4123df8>
 41292dc:      	mov	x23, x0
 41292e0:      	cbnz	x22, 0x41292c0 <_ChromeMain+0x4124024>
 41292e4:      	b	0x41292cc <_ChromeMain+0x4124030>
 41292e8:      	ldr	x0, [x19, #0x388]
 41292ec:      	mov	x1, x20
 41292f0:      	bl	0x78ab064 <_ChromeMain+0x78a5dc8>
 41292f4:      	b	0x41290fc <_ChromeMain+0x4123e60>
 41292f8:      	ldr	x0, [x19, #0x388]
 41292fc:      	mov	x1, x21
 4129300:      	bl	0x78ab064 <_ChromeMain+0x78a5dc8>
 4129304:      	cbnz	x20, 0x41290f8 <_ChromeMain+0x4123e5c>
 4129308:      	b	0x41290fc <_ChromeMain+0x4123e60>
 412930c:      	ldr	x20, [x19, #0x3c8]
 4129310:      	cbz	x20, 0x4129328 <_ChromeMain+0x412408c>
 4129314:      	mov	w8, #0x1                ; =1
 4129318:      	ldadd	w8, w8, [x20]
 412931c:      	mov	w9, #0x7fffffff         ; =2147483647
 4129320:      	cmp	w8, w9
 4129324:      	b.eq	0x4129470 <_ChromeMain+0x41241d4>
 4129328:      	ldr	x19, [x19, #0x3d0]
 412932c:      	mov	w0, #0x38               ; =56
 4129330:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4129334:      	mov	x1, x0
 4129338:      	mov	w8, #0x1                ; =1
 412933c:      	str	w8, [x0]
 4129340:      	adr	x8, 0x4129ae0 <_ChromeMain+0x4124844>
 4129344:      	nop
 4129348:      	adr	x9, 0x40374c0 <_ChromeMain+0x4032224>
 412934c:      	nop
 4129350:      	stp	x8, x9, [x0, #0x8]
 4129354:      	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4129358:      	add	x8, x8, #0xb00
 412935c:      	adrp	x9, 0x78ab000 <_ChromeMain+0x78a5d64>
 4129360:      	add	x9, x9, #0xbc0
 4129364:      	stp	x8, x9, [x0, #0x18]
 4129368:      	stp	x20, x19, [x0, #0x28]
 412936c:      	mov	x0, x22
 4129370:      	ldp	x29, x30, [sp, #0x40]
 4129374:      	ldp	x20, x19, [sp, #0x30]
 4129378:      	ldp	x22, x21, [sp, #0x20]
 412937c:      	ldp	x24, x23, [sp, #0x10]
 4129380:      	ldp	x26, x25, [sp], #0x50
 4129384:      	b	0xa6a7b80 <_ChromeMain+0xa6a28e4>
 4129388:      	cbz	w8, 0x4129244 <_ChromeMain+0x4123fa8>
 412938c:      	mov	w21, #0x0               ; =0
 4129390:      	ldr	x20, [x19, #0x330]
 4129394:      	ldr	x22, [x19, #0x3c8]
 4129398:      	cbz	x22, 0x41293b0 <_ChromeMain+0x4124114>
 412939c:      	mov	w8, #0x1                ; =1
 41293a0:      	ldadd	w8, w8, [x22]
 41293a4:      	mov	w9, #0x7fffffff         ; =2147483647
 41293a8:      	cmp	w8, w9
 41293ac:      	b.eq	0x4129494 <_ChromeMain+0x41241f8>
 41293b0:      	ldr	x23, [x19, #0x3d0]
 41293b4:      	mov	w0, #0x38               ; =56
 41293b8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 41293bc:      	mov	x1, x0
 41293c0:      	mov	w8, #0x1                ; =1
 41293c4:      	str	w8, [x0]
 41293c8:      	adr	x8, 0x4129ae0 <_ChromeMain+0x4124844>
 41293cc:      	nop
 41293d0:      	adr	x9, 0x40374c0 <_ChromeMain+0x4032224>
 41293d4:      	nop
 41293d8:      	stp	x8, x9, [x0, #0x8]
 41293dc:      	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 41293e0:      	add	x8, x8, #0xb00
 41293e4:      	adrp	x9, 0x78ab000 <_ChromeMain+0x78a5d64>
 41293e8:      	add	x9, x9, #0xbc0
 41293ec:      	stp	x8, x9, [x0, #0x18]
 41293f0:      	stp	x22, x23, [x0, #0x28]
 41293f4:      	mov	x0, x20
 41293f8:      	bl	0xa6a7b80 <_ChromeMain+0xa6a28e4>
 41293fc:      	tbz	w21, #0x0, 0x412916c <_ChromeMain+0x4123ed0>
 4129400:      	b	0x4129244 <_ChromeMain+0x4123fa8>
 4129404:      	ldr	x20, [x19, #0x3c8]
 4129408:      	cbz	x20, 0x4129420 <_ChromeMain+0x4124184>
 412940c:      	mov	w8, #0x1                ; =1
 4129410:      	ldadd	w8, w8, [x20]
 4129414:      	mov	w9, #0x7fffffff         ; =2147483647
 4129418:      	cmp	w8, w9
 412941c:      	b.eq	0x412947c <_ChromeMain+0x41241e0>
 4129420:      	ldr	x21, [x19, #0x3d0]
 4129424:      	mov	w0, #0x38               ; =56
 4129428:      	bl	0xf368 <_ChromeMain+0xa0cc>
 412942c:      	mov	x1, x0
 4129430:      	mov	w8, #0x1                ; =1
 4129434:      	str	w8, [x0]
 4129438:      	adr	x8, 0x4129ae0 <_ChromeMain+0x4124844>
 412943c:      	nop
 4129440:      	adr	x9, 0x40374c0 <_ChromeMain+0x4032224>
 4129444:      	nop
 4129448:      	stp	x8, x9, [x0, #0x8]
 412944c:      	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4129450:      	add	x8, x8, #0xb00
 4129454:      	adrp	x9, 0x78ab000 <_ChromeMain+0x78a5d64>
 4129458:      	add	x9, x9, #0xbc0
 412945c:      	stp	x8, x9, [x0, #0x18]
 4129460:      	stp	x20, x21, [x0, #0x28]
 4129464:      	mov	x0, x23
 4129468:      	bl	0xa6a7b80 <_ChromeMain+0xa6a28e4>
 412946c:      	b	0x4129100 <_ChromeMain+0x4123e64>
 4129470:      	brk	#0
 4129474:      	hlt	#0
 4129478:      	brk	#0x1
 412947c:      	brk	#0
 4129480:      	hlt	#0
 4129484:      	brk	#0x1
 4129488:      	brk	#0
 412948c:      	hlt	#0
 4129490:      	brk	#0x1
 4129494:      	brk	#0
 4129498:      	hlt	#0
 412949c:      	brk	#0x1
 41294a0:      	stp	x22, x21, [sp, #-0x30]!
 41294a4:      	stp	x20, x19, [sp, #0x10]
 41294a8:      	stp	x29, x30, [sp, #0x20]
 41294ac:      	add	x29, sp, #0x20
 41294b0:      	mov	x19, x0
 41294b4:      	mov	x20, x0
 41294b8:      	ldr	x8, [x20], #0xd8
 41294bc:      	ldr	x8, [x8, #0x68]
 41294c0:      	blr	x8
 41294c4:      	mov	x21, x0
 41294c8:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41294cc:      	add	x1, x1, #0x648
 41294d0:      	mov	x0, x20
 41294d4:      	mov	x2, #0x0                ; =0
 41294d8:      	mov	w3, #0x0                ; =0
 41294dc:      	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 41294e0:      	cbnz	x0, 0x41295e8 <_ChromeMain+0x412434c>
 41294e4:      	cbz	x21, 0x4129574 <_ChromeMain+0x41242d8>
 41294e8:      	mov	x0, x21
 41294ec:      	bl	0x8478d0 <_ChromeMain+0x842634>
 41294f0:      	cbz	x0, 0x4129564 <_ChromeMain+0x41242c8>
 41294f4:      	ldr	x8, [x19]
 41294f8:      	ldr	x8, [x8, #0x68]
 41294fc:      	mov	x0, x19
 4129500:      	blr	x8
 4129504:      	mov	x21, x0
 4129508:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 412950c:      	add	x1, x1, #0x648
 4129510:      	mov	x0, x20
 4129514:      	mov	x2, #0x0                ; =0
 4129518:      	mov	w3, #0x0                ; =0
 412951c:      	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 4129520:      	cbnz	x0, 0x41295f8 <_ChromeMain+0x412435c>
 4129524:      	cbz	x21, 0x412957c <_ChromeMain+0x41242e0>
 4129528:      	mov	x0, x21
 412952c:      	bl	0x8478d0 <_ChromeMain+0x842634>
 4129530:      	ldr	x8, [x0, #0x18]
 4129534:      	cmp	x8, #0x0
 4129538:      	cset	w9, ne
 412953c:      	cmp	x8, x19
 4129540:      	ccmp	x8, #0x0, #0x4, ne
 4129544:      	b.ne	0x4129584 <_ChromeMain+0x41242e8>
 4129548:      	tbnz	w9, #0x0, 0x4129560 <_ChromeMain+0x41242c4>
 412954c:      	cbz	x8, 0x4129574 <_ChromeMain+0x41242d8>
 4129550:      	ldr	x9, [x19, #0x338]
 4129554:      	cbz	x9, 0x41295bc <_ChromeMain+0x4124320>
 4129558:      	cmp	x8, x9
 412955c:      	b.ne	0x41295a4 <_ChromeMain+0x4124308>
 4129560:      	mov	w0, #0x1                ; =1
 4129564:      	ldp	x29, x30, [sp, #0x20]
 4129568:      	ldp	x20, x19, [sp, #0x10]
 412956c:      	ldp	x22, x21, [sp], #0x30
 4129570:      	ret
 4129574:      	mov	w0, #0x0                ; =0
 4129578:      	b	0x4129564 <_ChromeMain+0x41242c8>
 412957c:      	mov	x0, #0x0                ; =0
 4129580:      	b	0x4129530 <_ChromeMain+0x4124294>
 4129584:      	mov	x10, x8
 4129588:      	ldr	x10, [x10, #0x188]
 412958c:      	cmp	x10, #0x0
 4129590:      	cset	w9, ne
 4129594:      	cmp	x10, x19
 4129598:      	ccmp	x10, #0x0, #0x4, ne
 412959c:      	b.ne	0x4129588 <_ChromeMain+0x41242ec>
 41295a0:      	b	0x4129548 <_ChromeMain+0x41242ac>
 41295a4:      	mov	x10, x8
 41295a8:      	ldr	x10, [x10, #0x188]
 41295ac:      	cmp	x10, x9
 41295b0:      	ccmp	x10, #0x0, #0x4, ne
 41295b4:      	b.ne	0x41295a8 <_ChromeMain+0x412430c>
 41295b8:      	cbnz	x10, 0x4129560 <_ChromeMain+0x41242c4>
 41295bc:      	ldr	x9, [x19, #0x360]
 41295c0:      	cbz	x9, 0x4129574 <_ChromeMain+0x41242d8>
 41295c4:      	cmp	x8, x9
 41295c8:      	b.eq	0x4129560 <_ChromeMain+0x41242c4>
 41295cc:      	ldr	x8, [x8, #0x188]
 41295d0:      	cmp	x8, #0x0
 41295d4:      	cset	w0, ne
 41295d8:      	cmp	x8, x9
 41295dc:      	ccmp	x8, #0x0, #0x4, ne
 41295e0:      	b.ne	0x41295cc <_ChromeMain+0x4124330>
 41295e4:      	b	0x4129564 <_ChromeMain+0x41242c8>
 41295e8:      	cbz	x21, 0x41294f4 <_ChromeMain+0x4124258>
 41295ec:      	brk	#0
 41295f0:      	hlt	#0
 41295f4:      	brk	#0x1
 41295f8:      	cbz	x21, 0x4129530 <_ChromeMain+0x4124294>
 41295fc:      	brk	#0
 4129600:      	hlt	#0
 4129604:      	brk	#0x1
		...
 4129620:      	ldr	x0, [x0, #0x360]
 4129624:      	ret
