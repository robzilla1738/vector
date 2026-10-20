
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 466fb20: d101c3ff     	sub	sp, sp, #0x70
 466fb24: a90457f6     	stp	x22, x21, [sp, #0x40]
 466fb28: a9054ff4     	stp	x20, x19, [sp, #0x50]
 466fb2c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 466fb30: 910183fd     	add	x29, sp, #0x60
 466fb34: f9401413     	ldr	x19, [x0, #0x28]
 466fb38: f900141f     	str	xzr, [x0, #0x28]
 466fb3c: b40008b3     	cbz	x19, 0x466fc50 <_ChromeMain+0x466a9b4>
 466fb40: f9401814     	ldr	x20, [x0, #0x30]
 466fb44: 19404268     	ldapurb	w8, [x19, #0x4]
 466fb48: 7100043f     	cmp	w1, #0x1
 466fb4c: 540007a1     	b.ne	0x466fc40 <_ChromeMain+0x466a9a4>
 466fb50: 7100011f     	cmp	w8, #0x0
 466fb54: fa400a84     	ccmp	x20, #0x0, #0x4, eq
 466fb58: 54000740     	b.eq	0x466fc40 <_ChromeMain+0x466a9a4>
 466fb5c: 19404268     	ldapurb	w8, [x19, #0x4]
 466fb60: 350008a8     	cbnz	w8, 0x466fc74 <_ChromeMain+0x466a9d8>
 466fb64: 52800228     	mov	w8, #0x11               ; =17
 466fb68: 3900dfe8     	strb	w8, [sp, #0x37]
 466fb6c: 910083e9     	add	x9, sp, #0x20
 466fb70: 9100452a     	add	x10, x9, #0x11
 466fb74: 9004c2e8     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 466fb78: 912b6508     	add	x8, x8, #0xad9
 466fb7c: eb08015f     	cmp	x10, x8
 466fb80: fa488122     	ccmp	x9, x8, #0x2, hi
 466fb84: 540007c9     	b.ls	0x466fc7c <_ChromeMain+0x466a9e0>
 466fb88: 52800e69     	mov	w9, #0x73               ; =115
 466fb8c: 790063e9     	strh	w9, [sp, #0x30]
 466fb90: 3dc00100     	ldr	q0, [x8]
 466fb94: 3d800be0     	str	q0, [sp, #0x20]
 466fb98: 390003ff     	strb	wzr, [sp]
 466fb9c: 390063ff     	strb	wzr, [sp, #0x18]
 466fba0: f94a0695     	ldr	x21, [x20, #0x1408]
 466fba4: b40000d5     	cbz	x21, 0x466fbbc <_ChromeMain+0x466a920>
 466fba8: 52800028     	mov	w8, #0x1                ; =1
 466fbac: b82802a8     	ldadd	w8, w8, [x21]
 466fbb0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 466fbb4: 6b09011f     	cmp	w8, w9
 466fbb8: 54000640     	b.eq	0x466fc80 <_ChromeMain+0x466a9e4>
 466fbbc: f94a0a96     	ldr	x22, [x20, #0x1410]
 466fbc0: 52800700     	mov	w0, #0x38               ; =56
 466fbc4: 96e67de9     	bl	0xf368 <_ChromeMain+0xa0cc>
 466fbc8: aa0003e3     	mov	x3, x0
 466fbcc: 52800028     	mov	w8, #0x1                ; =1
 466fbd0: b9000008     	str	w8, [x0]
 466fbd4: 10008288     	adr	x8, 0x4670c24 <_ChromeMain+0x466b988>
 466fbd8: d503201f     	nop
 466fbdc: 90ffcec9     	adrp	x9, 0x4047000 <_ChromeMain+0x4041d64>
 466fbe0: 91160129     	add	x9, x9, #0x580
 466fbe4: a900a408     	stp	x8, x9, [x0, #0x8]
 466fbe8: d0fef768     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 466fbec: 912c0108     	add	x8, x8, #0xb00
 466fbf0: f9000c08     	str	x8, [x0, #0x18]
 466fbf4: a902d815     	stp	x21, x22, [x0, #0x28]
 466fbf8: 910083e1     	add	x1, sp, #0x20
 466fbfc: 910003e2     	mov	x2, sp
 466fc00: aa1403e0     	mov	x0, x20
 466fc04: 97ff2f18     	bl	0x463b864 <_ChromeMain+0x46365c8>
 466fc08: 394063e8     	ldrb	w8, [sp, #0x18]
 466fc0c: 340000e8     	cbz	w8, 0x466fc28 <_ChromeMain+0x466a98c>
 466fc10: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 466fc14: 36f800a8     	tbz	w8, #0x1f, 0x466fc28 <_ChromeMain+0x466a98c>
 466fc18: f94003e0     	ldr	x0, [sp]
 466fc1c: f9400be8     	ldr	x8, [sp, #0x10]
 466fc20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466fc24: 96e664a5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466fc28: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 466fc2c: 36f800a8     	tbz	w8, #0x1f, 0x466fc40 <_ChromeMain+0x466a9a4>
 466fc30: f94013e0     	ldr	x0, [sp, #0x20]
 466fc34: f9401be8     	ldr	x8, [sp, #0x30]
 466fc38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466fc3c: 96e6649f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466fc40: 12800008     	mov	w8, #-0x1               ; =-1
 466fc44: b8e80268     	ldaddal	w8, w8, [x19]
 466fc48: 7100051f     	cmp	w8, #0x1
 466fc4c: 540000c0     	b.eq	0x466fc64 <_ChromeMain+0x466a9c8>
 466fc50: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 466fc54: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 466fc58: a94457f6     	ldp	x22, x21, [sp, #0x40]
 466fc5c: 9101c3ff     	add	sp, sp, #0x70
 466fc60: d65f03c0     	ret
 466fc64: aa1303e0     	mov	x0, x19
 466fc68: 52800101     	mov	w1, #0x8                ; =8
 466fc6c: 96e66493     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466fc70: 17fffff8     	b	0x466fc50 <_ChromeMain+0x466a9b4>
 466fc74: d4200000     	brk	#0
 466fc78: d4400000     	hlt	#0
 466fc7c: d4200020     	brk	#0x1
 466fc80: d4200000     	brk	#0
