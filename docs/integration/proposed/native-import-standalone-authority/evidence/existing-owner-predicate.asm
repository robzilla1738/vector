
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4203838: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 420383c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4203840: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4203844: 910083fd     	add	x29, sp, #0x20
 4203848: f100a035     	subs	x21, x1, #0x28
 420384c: 54000420     	b.eq	0x42038d0 <_ChromeMain+0x41fe634>
 4203850: aa0103f4     	mov	x20, x1
 4203854: f9402828     	ldr	x8, [x1, #0x50]
 4203858: b40003c8     	cbz	x8, 0x42038d0 <_ChromeMain+0x41fe634>
 420385c: aa0003f3     	mov	x19, x0
 4203860: b0054681     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4203864: 912b4021     	add	x1, x1, #0xad0
 4203868: 91056280     	add	x0, x20, #0x158
 420386c: 96fc4390     	bl	0x1146ac <_ChromeMain+0x10f410>
 4203870: 3940fc09     	ldrb	w9, [x0, #0x3f]
 4203874: 13001d28     	sxtb	w8, w9
 4203878: f940180a     	ldr	x10, [x0, #0x30]
 420387c: 7100011f     	cmp	w8, #0x0
 4203880: 9a894149     	csel	x9, x10, x9, mi
 4203884: f100453f     	cmp	x9, #0x11
 4203888: 54000241     	b.ne	0x42038d0 <_ChromeMain+0x41fe634>
 420388c: f8428c09     	ldr	x9, [x0, #0x28]!
 4203890: 7100011f     	cmp	w8, #0x0
 4203894: 9a804128     	csel	x8, x9, x0, mi
 4203898: a9402909     	ldp	x9, x10, [x8]
 420389c: 39404108     	ldrb	w8, [x8, #0x10]
 42038a0: 7101851f     	cmp	w8, #0x61
 42038a4: d28dee08     	mov	x8, #0x6f70             ; =28528
 42038a8: f2ae8e48     	movk	x8, #0x7472, lsl #16
 42038ac: f2cc85a8     	movk	x8, #0x642d, lsl #32
 42038b0: f2ee8c28     	movk	x8, #0x7461, lsl #48
 42038b4: fa480140     	ccmp	x10, x8, #0x0, eq
 42038b8: d28e6c28     	mov	x8, #0x7361             ; =29537
 42038bc: f2ac8d28     	movk	x8, #0x6469, lsl #16
 42038c0: f2c5aca8     	movk	x8, #0x2d65, lsl #32
 42038c4: f2edad28     	movk	x8, #0x6d69, lsl #48
 42038c8: fa480120     	ccmp	x9, x8, #0x0, eq
 42038cc: 540000c0     	b.eq	0x42038e4 <_ChromeMain+0x41fe648>
 42038d0: 52800020     	mov	w0, #0x1                ; =1
 42038d4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42038d8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42038dc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 42038e0: d65f03c0     	ret
 42038e4: f9402280     	ldr	x0, [x20, #0x40]
 42038e8: f9400008     	ldr	x8, [x0]
 42038ec: f940a508     	ldr	x8, [x8, #0x148]
 42038f0: d63f0100     	blr	x8
 42038f4: f9400268     	ldr	x8, [x19]
 42038f8: f9400108     	ldr	x8, [x8]
 42038fc: eb08001f     	cmp	x0, x8
 4203900: 54fffe81     	b.ne	0x42038d0 <_ChromeMain+0x41fe634>
 4203904: 52800000     	mov	w0, #0x0                ; =0
 4203908: f9400668     	ldr	x8, [x19, #0x8]
 420390c: f9000115     	str	x21, [x8]
 4203910: 17fffff1     	b	0x42038d4 <_ChromeMain+0x41fe638>
