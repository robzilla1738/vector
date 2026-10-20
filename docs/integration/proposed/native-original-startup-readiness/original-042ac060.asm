
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42ac060:      	sub	sp, sp, #0x180
 42ac064:      	stp	x26, x25, [sp, #0x130]
 42ac068:      	stp	x24, x23, [sp, #0x140]
 42ac06c:      	stp	x22, x21, [sp, #0x150]
 42ac070:      	stp	x20, x19, [sp, #0x160]
 42ac074:      	stp	x29, x30, [sp, #0x170]
 42ac078:      	add	x29, sp, #0x170
 42ac07c:      	mov	x19, x0
 42ac080:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42ac084:      	ldr	w8, [x8, #0xb0]
 42ac088:      	cmp	w8, #0x2
 42ac08c:      	b.gt	0x42ac0c8 <_ChromeMain+0x42a6e2c>
 42ac090:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42ac094:      	add	x1, x1, #0x193
 42ac098:      	mov	x20, sp
 42ac09c:      	mov	x0, sp
 42ac0a0:      	mov	w2, #0x735              ; =1845
 42ac0a4:      	mov	w3, #0x2                ; =2
 42ac0a8:      	bl	0x60914c <_ChromeMain+0x603eb0>
 42ac0ac:      	adrp	x1, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42ac0b0:      	add	x1, x1, #0x1d4
 42ac0b4:      	add	x0, x20, #0x10
 42ac0b8:      	mov	w2, #0x52               ; =82
 42ac0bc:      	bl	0x254bc <_ChromeMain+0x20220>
 42ac0c0:      	mov	x0, sp
 42ac0c4:      	bl	0x609080 <_ChromeMain+0x603de4>
 42ac0c8:      	mov	w8, #0x3                ; =3
 42ac0cc:      	str	w8, [x19, #0x390]
 42ac0d0:      	add	x0, x19, #0x2b8
 42ac0d4:      	bl	0x72e718 <_ChromeMain+0x72947c>
 42ac0d8:      	ldr	x0, [x19, #0x190]
 42ac0dc:      	str	xzr, [x19, #0x190]
 42ac0e0:      	cbz	x0, 0x42ac0f0 <_ChromeMain+0x42a6e54>
 42ac0e4:      	bl	0x162db98 <_ChromeMain+0x16288fc>
 42ac0e8:      	mov	w1, #0x228              ; =552
 42ac0ec:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac0f0:      	ldr	x8, [x19, #0x398]
 42ac0f4:      	cbz	x8, 0x42ac14c <_ChromeMain+0x42a6eb0>
 42ac0f8:      	ldapurb	w8, [x8, #0x4]
 42ac0fc:      	cbnz	w8, 0x42ac14c <_ChromeMain+0x42a6eb0>
 42ac100:      	ldr	x8, [x19, #0x3a0]
 42ac104:      	cbz	x8, 0x42ac14c <_ChromeMain+0x42a6eb0>
 42ac108:      	ldr	x20, [x19, #0x418]
 42ac10c:      	cbz	x20, 0x42ac13c <_ChromeMain+0x42a6ea0>
 42ac110:      	str	xzr, [x19, #0x418]
 42ac114:      	ldr	x1, [x19, #0x410]
 42ac118:      	add	x0, x20, #0x80
 42ac11c:      	bl	0x1d79ba4 <_ChromeMain+0x1d74908>
 42ac120:      	and	x8, x20, #0xfffffffc00000000
 42ac124:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42ac128:      	ldr	x9, [x9, #0x88]
 42ac12c:      	cmp	x8, x9
 42ac130:      	b.ne	0x42ac13c <_ChromeMain+0x42a6ea0>
 42ac134:      	mov	x0, x20
 42ac138:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42ac13c:      	ldr	x0, [x19, #0x398]
 42ac140:      	str	xzr, [x19, #0x398]
 42ac144:      	cbnz	x0, 0x42ac248 <_ChromeMain+0x42a6fac>
 42ac148:      	str	xzr, [x19, #0x3a0]
 42ac14c:      	ldrb	w8, [x19, #0x3aa]
 42ac150:      	tbnz	w8, #0x0, 0x42ac160 <_ChromeMain+0x42a6ec4>
 42ac154:      	mov	w8, #0x1                ; =1
 42ac158:      	strb	w8, [x19, #0x3aa]
 42ac15c:      	bl	0x42a71f0 <_ChromeMain+0x42a1f54>
 42ac160:      	ldr	x20, [x19, #0x3c0]
 42ac164:      	str	xzr, [x19, #0x3c0]
 42ac168:      	add	x8, x19, #0x3c8
 42ac16c:      	ldr	x22, [x19, #0x3c8]
 42ac170:      	ldr	x21, [x19, #0x3d0]
 42ac174:      	movi.2d	v0, #0000000000000000
 42ac178:      	str	q0, [x8]
 42ac17c:      	lsl	x23, x22, #3
 42ac180:      	cbz	x23, 0x42ac190 <_ChromeMain+0x42a6ef4>
 42ac184:      	mov	x24, #0x0               ; =0
 42ac188:      	mov	w25, #-0x1              ; =-1
 42ac18c:      	b	0x42ac1b0 <_ChromeMain+0x42a6f14>
 42ac190:      	cbz	x20, 0x42ac1e0 <_ChromeMain+0x42a6f44>
 42ac194:      	b	0x42ac220 <_ChromeMain+0x42a6f84>
 42ac198:      	ldr	x8, [x19, #0x10]
 42ac19c:      	mov	x0, x19
 42ac1a0:      	blr	x8
 42ac1a4:      	add	x24, x24, #0x8
 42ac1a8:      	cmp	x23, x24
 42ac1ac:      	b.eq	0x42ac1dc <_ChromeMain+0x42a6f40>
 42ac1b0:      	ldr	x19, [x20, x24]
 42ac1b4:      	cbz	x19, 0x42ac268 <_ChromeMain+0x42a6fcc>
 42ac1b8:      	str	xzr, [x20, x24]
 42ac1bc:      	ldr	x8, [x19, #0x8]
 42ac1c0:      	mov	x0, x19
 42ac1c4:      	mov	w1, #0x0                ; =0
 42ac1c8:      	blr	x8
 42ac1cc:      	ldaddal	w25, w8, [x19]
 42ac1d0:      	cmp	w8, #0x1
 42ac1d4:      	b.ne	0x42ac1a4 <_ChromeMain+0x42a6f08>
 42ac1d8:      	b	0x42ac198 <_ChromeMain+0x42a6efc>
 42ac1dc:      	cbnz	x20, 0x42ac1fc <_ChromeMain+0x42a6f60>
 42ac1e0:      	ldp	x29, x30, [sp, #0x170]
 42ac1e4:      	ldp	x20, x19, [sp, #0x160]
 42ac1e8:      	ldp	x22, x21, [sp, #0x150]
 42ac1ec:      	ldp	x24, x23, [sp, #0x140]
 42ac1f0:      	ldp	x26, x25, [sp, #0x130]
 42ac1f4:      	add	sp, sp, #0x180
 42ac1f8:      	ret
 42ac1fc:      	add	x8, x23, x20
 42ac200:      	sub	x19, x8, #0x8
 42ac204:      	neg	x22, x22, lsl #3
 42ac208:      	mov	w23, #-0x1              ; =-1
 42ac20c:      	cbz	x19, 0x42ac264 <_ChromeMain+0x42a6fc8>
 42ac210:      	ldr	x0, [x19], #-0x8
 42ac214:      	cbnz	x0, 0x42ac230 <_ChromeMain+0x42a6f94>
 42ac218:      	adds	x22, x22, #0x8
 42ac21c:      	b.ne	0x42ac20c <_ChromeMain+0x42a6f70>
 42ac220:      	lsl	x1, x21, #3
 42ac224:      	mov	x0, x20
 42ac228:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac22c:      	b	0x42ac1e0 <_ChromeMain+0x42a6f44>
 42ac230:      	ldaddal	w23, w8, [x0]
 42ac234:      	cmp	w8, #0x1
 42ac238:      	b.ne	0x42ac218 <_ChromeMain+0x42a6f7c>
 42ac23c:      	ldr	x8, [x0, #0x10]
 42ac240:      	blr	x8
 42ac244:      	b	0x42ac218 <_ChromeMain+0x42a6f7c>
 42ac248:      	mov	w8, #-0x1               ; =-1
 42ac24c:      	ldaddal	w8, w8, [x0]
 42ac250:      	cmp	w8, #0x1
 42ac254:      	b.ne	0x42ac148 <_ChromeMain+0x42a6eac>
 42ac258:      	mov	w1, #0x8                ; =8
 42ac25c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac260:      	b	0x42ac148 <_ChromeMain+0x42a6eac>
 42ac264:      	brk	#0x1
 42ac268:      	brk	#0
