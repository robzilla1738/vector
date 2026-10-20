
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243f74: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4243f78: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4243f7c: 910043fd     	add	x29, sp, #0x10
 4243f80: aa0003f3     	mov	x19, x0
 4243f84: 979fa14e     	bl	0x2a2c4bc <_ChromeMain+0x2a27220>
 4243f88: f9431e60     	ldr	x0, [x19, #0x638]
 4243f8c: b40000a0     	cbz	x0, 0x4243fa0 <_ChromeMain+0x423ed04>
 4243f90: 3958c268     	ldrb	w8, [x19, #0x630]
 4243f94: 340000c8     	cbz	w8, 0x4243fac <_ChromeMain+0x423ed10>
 4243f98: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243f9c: 37000228     	tbnz	w8, #0x0, 0x4243fe0 <_ChromeMain+0x423ed44>
 4243fa0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4243fa4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4243fa8: d65f03c0     	ret
 4243fac: b943be68     	ldr	w8, [x19, #0x3bc]
 4243fb0: 7100051f     	cmp	w8, #0x1
 4243fb4: 540000a1     	b.ne	0x4243fc8 <_ChromeMain+0x423ed2c>
 4243fb8: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243fbc: 3707ff28     	tbnz	w8, #0x0, 0x4243fa0 <_ChromeMain+0x423ed04>
 4243fc0: 52800021     	mov	w1, #0x1                ; =1
 4243fc4: 14000008     	b	0x4243fe4 <_ChromeMain+0x423ed48>
 4243fc8: 7100091f     	cmp	w8, #0x2
 4243fcc: 1a9f17e1     	cset	w1, eq
 4243fd0: 39472008     	ldrb	w8, [x0, #0x1c8]
 4243fd4: 6b08003f     	cmp	w1, w8
 4243fd8: 54fffe40     	b.eq	0x4243fa0 <_ChromeMain+0x423ed04>
 4243fdc: 14000002     	b	0x4243fe4 <_ChromeMain+0x423ed48>
 4243fe0: 52800001     	mov	w1, #0x0                ; =0
 4243fe4: f9400008     	ldr	x8, [x0]
 4243fe8: f9405108     	ldr	x8, [x8, #0xa0]
 4243fec: d63f0100     	blr	x8
 4243ff0: aa1303e0     	mov	x0, x19
 4243ff4: 52800001     	mov	w1, #0x0                ; =0
 4243ff8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4243ffc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4244000: 170fb11d     	b	0x630474 <_ChromeMain+0x62b1d8>
