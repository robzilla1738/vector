
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2986c5c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 2986c60: a9017bfd     	stp	x29, x30, [sp, #0x10]
 2986c64: 910043fd     	add	x29, sp, #0x10
 2986c68: aa0103f3     	mov	x19, x1
 2986c6c: aa0003f4     	mov	x20, x0
 2986c70: 94000042     	bl	0x2986d78 <_ChromeMain+0x2981adc>
 2986c74: d0061dc8     	adrp	x8, 0xed40000 <dyld_stub_binder+0xed40000>
 2986c78: 91148108     	add	x8, x8, #0x520
 2986c7c: f9400509     	ldr	x9, [x8, #0x8]
 2986c80: 8b090529     	add	x9, x9, x9, lsl #1
 2986c84: d37ef529     	lsl	x9, x9, #2
 2986c88: b4000129     	cbz	x9, 0x2986cac <_ChromeMain+0x2981a10>
 2986c8c: f9400108     	ldr	x8, [x8]
 2986c90: 91001108     	add	x8, x8, #0x4
 2986c94: b940050a     	ldr	w10, [x8, #0x4]
 2986c98: 6b14015f     	cmp	w10, w20
 2986c9c: 540003c0     	b.eq	0x2986d14 <_ChromeMain+0x2981a78>
 2986ca0: 91003108     	add	x8, x8, #0xc
 2986ca4: f1003129     	subs	x9, x9, #0xc
 2986ca8: 54ffff61     	b.ne	0x2986c94 <_ChromeMain+0x29819f8>
 2986cac: 97cb9351     	bl	0x1c6b9f0 <_ChromeMain+0x1c66754>
 2986cb0: f8408c08     	ldr	x8, [x0, #0x8]!
 2986cb4: b4000148     	cbz	x8, 0x2986cdc <_ChromeMain+0x2981a40>
 2986cb8: 14000003     	b	0x2986cc4 <_ChromeMain+0x2981a28>
 2986cbc: f9400108     	ldr	x8, [x8]
 2986cc0: b40000e8     	cbz	x8, 0x2986cdc <_ChromeMain+0x2981a40>
 2986cc4: b9402109     	ldr	w9, [x8, #0x20]
 2986cc8: 6b09029f     	cmp	w20, w9
 2986ccc: 54ffff8b     	b.lt	0x2986cbc <_ChromeMain+0x2981a20>
 2986cd0: 5400006d     	b.le	0x2986cdc <_ChromeMain+0x2981a40>
 2986cd4: f9400508     	ldr	x8, [x8, #0x8]
 2986cd8: b5ffff68     	cbnz	x8, 0x2986cc4 <_ChromeMain+0x2981a28>
 2986cdc: f100011f     	cmp	x8, #0x0
 2986ce0: 9a880009     	csel	x9, x0, x8, eq
 2986ce4: 9100a128     	add	x8, x9, #0x28
 2986ce8: f100011f     	cmp	x8, #0x0
 2986cec: fa401124     	ccmp	x9, x0, #0x4, ne
 2986cf0: 540000e0     	b.eq	0x2986d0c <_ChromeMain+0x2981a70>
 2986cf4: ad400500     	ldp	q0, q1, [x8]
 2986cf8: ad000660     	stp	q0, q1, [x19]
 2986cfc: 52800020     	mov	w0, #0x1                ; =1
 2986d00: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 2986d04: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 2986d08: d65f03c0     	ret
 2986d0c: 52800000     	mov	w0, #0x0                ; =0
 2986d10: 17fffffc     	b	0x2986d00 <_ChromeMain+0x2981a64>
 2986d14: 385fc109     	ldurb	w9, [x8, #-0x4]
 2986d18: 531c6d29     	lsl	w9, w9, #4
 2986d1c: 385fd10a     	ldurb	w10, [x8, #-0x3]
 2986d20: 2a0a0529     	orr	w9, w9, w10, lsl #1
 2986d24: 385fe10a     	ldurb	w10, [x8, #-0x2]
 2986d28: 2a0a0929     	orr	w9, w9, w10, lsl #2
 2986d2c: 385ff10a     	ldurb	w10, [x8, #-0x1]
 2986d30: 2a0a0d29     	orr	w9, w9, w10, lsl #3
 2986d34: b9400108     	ldr	w8, [x8]
 2986d38: 7219211f     	tst	w8, #0xff80
 2986d3c: 540001a1     	b.ne	0x2986d70 <_ChromeMain+0x2981ad4>
 2986d40: 92401908     	and	x8, x8, #0x7f
 2986d44: 9005454a     	adrp	x10, 0xd22e000 <dyld_stub_binder+0xd22e000>
 2986d48: 912db14a     	add	x10, x10, #0xb6c
 2986d4c: 78687948     	ldrh	w8, [x10, x8, lsl #1]
 2986d50: 79000268     	strh	w8, [x19]
 2986d54: 2900a67f     	stp	wzr, w9, [x19, #0x4]
 2986d58: f9000a7f     	str	xzr, [x19, #0x10]
 2986d5c: 3900627f     	strb	wzr, [x19, #0x18]
 2986d60: 12800008     	mov	w8, #-0x1               ; =-1
 2986d64: 52800020     	mov	w0, #0x1                ; =1
 2986d68: b9001e68     	str	w8, [x19, #0x1c]
 2986d6c: 17ffffe5     	b	0x2986d00 <_ChromeMain+0x2981a64>
 2986d70: 52800008     	mov	w8, #0x0                ; =0
 2986d74: 17fffff7     	b	0x2986d50 <_ChromeMain+0x2981ab4>
