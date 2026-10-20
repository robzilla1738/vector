
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d4705c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7d47060: 910003fd     	mov	x29, sp
 7d47064: 94000009     	bl	0x7d47088 <_ChromeMain+0x7d41dec>
 7d47068: 52800300     	mov	w0, #0x18               ; =24
 7d4706c: 960b20bf     	bl	0xf368 <_ChromeMain+0xa0cc>
 7d47070: b00326e8     	adrp	x8, 0xe224000 <dyld_stub_binder+0xe224000>
 7d47074: 9110c108     	add	x8, x8, #0x430
 7d47078: a9007c08     	stp	x8, xzr, [x0]
 7d4707c: 7900201f     	strh	wzr, [x0, #0x10]
 7d47080: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7d47084: d65f03c0     	ret
 7d47088: b0037fe8     	adrp	x8, 0xed44000 <dyld_stub_binder+0xed44000>
 7d4708c: 9102e108     	add	x8, x8, #0xb8
 7d47090: 38bfc108     	ldaprb	w8, [x8]
 7d47094: 36000048     	tbz	w8, #0x0, 0x7d4709c <_ChromeMain+0x7d41e00>
 7d47098: d65f03c0     	ret
 7d4709c: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7d470a0: 910003fd     	mov	x29, sp
 7d470a4: b0037fe0     	adrp	x0, 0xed44000 <dyld_stub_binder+0xed44000>
 7d470a8: 9102e000     	add	x0, x0, #0xb8
 7d470ac: 9537b960     	bl	0xcb3562c <_ChromeMain+0xcb30390>
 7d470b0: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7d470b4: 34ffff20     	cbz	w0, 0x7d47098 <_ChromeMain+0x7d41dfc>
 7d470b8: b0037fe0     	adrp	x0, 0xed44000 <dyld_stub_binder+0xed44000>
 7d470bc: 9102e000     	add	x0, x0, #0xb8
 7d470c0: 1537b9af     	b	0xcb3577c <_ChromeMain+0xcb304e0>
 7d470c4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d470c8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d470cc: 910043fd     	add	x29, sp, #0x10
 7d470d0: aa0003f3     	mov	x19, x0
 7d470d4: f9400400     	ldr	x0, [x0, #0x8]
 7d470d8: b00326e8     	adrp	x8, 0xe224000 <dyld_stub_binder+0xe224000>
 7d470dc: 9110c108     	add	x8, x8, #0x430
 7d470e0: a9007e68     	stp	x8, xzr, [x19]
 7d470e4: b4000080     	cbz	x0, 0x7d470f4 <_ChromeMain+0x7d41e58>
 7d470e8: 97ad6336     	bl	0x689fdc0 <_ChromeMain+0x689ab24>
 7d470ec: 52800801     	mov	w1, #0x40               ; =64
 7d470f0: 960b0772     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d470f4: aa1303e0     	mov	x0, x19
 7d470f8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d470fc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d47100: d65f03c0     	ret
 7d47104: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d47108: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d4710c: 910043fd     	add	x29, sp, #0x10
 7d47110: aa0003f3     	mov	x19, x0
 7d47114: f9400400     	ldr	x0, [x0, #0x8]
 7d47118: b00326e8     	adrp	x8, 0xe224000 <dyld_stub_binder+0xe224000>
 7d4711c: 9110c108     	add	x8, x8, #0x430
 7d47120: a9007e68     	stp	x8, xzr, [x19]
 7d47124: b4000080     	cbz	x0, 0x7d47134 <_ChromeMain+0x7d41e98>
 7d47128: 97ad6326     	bl	0x689fdc0 <_ChromeMain+0x689ab24>
 7d4712c: 52800801     	mov	w1, #0x40               ; =64
 7d47130: 960b0762     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d47134: aa1303e0     	mov	x0, x19
 7d47138: 52800301     	mov	w1, #0x18               ; =24
 7d4713c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d47140: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d47144: 160b075d     	b	0x8eb8 <_ChromeMain+0x3c1c>
 7d47148: 39404008     	ldrb	w8, [x0, #0x10]
 7d4714c: 35000288     	cbnz	w8, 0x7d4719c <_ChromeMain+0x7d41f00>
 7d47150: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d47154: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d47158: 910043fd     	add	x29, sp, #0x10
 7d4715c: aa0003f3     	mov	x19, x0
 7d47160: 52800800     	mov	w0, #0x40               ; =64
 7d47164: 960b2081     	bl	0xf368 <_ChromeMain+0xa0cc>
 7d47168: aa0003f4     	mov	x20, x0
 7d4716c: 97fff46c     	bl	0x7d4431c <_ChromeMain+0x7d3f080>
 7d47170: f9400660     	ldr	x0, [x19, #0x8]
 7d47174: f9000674     	str	x20, [x19, #0x8]
 7d47178: b4000080     	cbz	x0, 0x7d47188 <_ChromeMain+0x7d41eec>
 7d4717c: 97ad6311     	bl	0x689fdc0 <_ChromeMain+0x689ab24>
 7d47180: 52800801     	mov	w1, #0x40               ; =64
 7d47184: 960b074d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d47188: 52800028     	mov	w8, #0x1                ; =1
 7d4718c: 39004268     	strb	w8, [x19, #0x10]
 7d47190: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d47194: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d47198: d65f03c0     	ret
 7d4719c: d4200000     	brk	#0
 7d471a0: d4400000     	hlt	#0
 7d471a4: d4200020     	brk	#0x1
