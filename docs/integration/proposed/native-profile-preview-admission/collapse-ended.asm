
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b7b0: 393de27f     	strb	wzr, [x19, #0xf78]
 464b7b4: f9423e60     	ldr	x0, [x19, #0x478]
 464b7b8: b4000060     	cbz	x0, 0x464b7c4 <_ChromeMain+0x4646528>
 464b7bc: 52800001     	mov	w1, #0x0                ; =0
 464b7c0: 94c97e8e     	bl	0x78ab1f8 <_ChromeMain+0x78a5f5c>
 464b7c4: f942da68     	ldr	x8, [x19, #0x5b0]
 464b7c8: b40002e8     	cbz	x8, 0x464b824 <_ChromeMain+0x4646588>
 464b7cc: f941a114     	ldr	x20, [x8, #0x340]
 464b7d0: b40002b4     	cbz	x20, 0x464b824 <_ChromeMain+0x4646588>
 464b7d4: f9400288     	ldr	x8, [x20]
 464b7d8: f9402d08     	ldr	x8, [x8, #0x58]
 464b7dc: aa1403e0     	mov	x0, x20
 464b7e0: d63f0100     	blr	x8
 464b7e4: aa0003f5     	mov	x21, x0
 464b7e8: 94e5adeb     	bl	0x7fb6f94 <_ChromeMain+0x7fb1cf8>
 464b7ec: f10002bf     	cmp	x21, #0x0
 464b7f0: 1a9f07e8     	cset	w8, ne
 464b7f4: eb0002bf     	cmp	x21, x0
 464b7f8: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 464b7fc: 540000c0     	b.eq	0x464b814 <_ChromeMain+0x4646578>
 464b800: f94026b5     	ldr	x21, [x21, #0x48]
 464b804: f10002bf     	cmp	x21, #0x0
 464b808: 1a9f07e8     	cset	w8, ne
 464b80c: fa4012a4     	ccmp	x21, x0, #0x4, ne
 464b810: 54ffff81     	b.ne	0x464b800 <_ChromeMain+0x4646564>
 464b814: 34000088     	cbz	w8, 0x464b824 <_ChromeMain+0x4646588>
 464b818: aa1403e0     	mov	x0, x20
 464b81c: 52800001     	mov	w1, #0x0                ; =0
 464b820: 94e5a4da     	bl	0x7fb4b88 <_ChromeMain+0x7faf8ec>
 464b824: f9435660     	ldr	x0, [x19, #0x6a8]
 464b828: b4000060     	cbz	x0, 0x464b834 <_ChromeMain+0x4646598>
 464b82c: d2800001     	mov	x1, #0x0                ; =0
 464b830: 97feeb14     	bl	0x4606480 <_ChromeMain+0x46011e4>
 464b834: f942d668     	ldr	x8, [x19, #0x5a8]
 464b838: b4000048     	cbz	x8, 0x464b840 <_ChromeMain+0x46465a4>
 464b83c: 391e927f     	strb	wzr, [x19, #0x7a4]
 464b840: aa1303e0     	mov	x0, x19
 464b844: 52800021     	mov	w1, #0x1                ; =1
 464b848: 97fffc1e     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 464b84c: aa1303e0     	mov	x0, x19
 464b850: 52800001     	mov	w1, #0x0                ; =0
 464b854: 96ff9308     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b858: 972e6717     	bl	0x11e54b4 <_ChromeMain+0x11e0218>
 464b85c: d0052441     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 464b860: 91200021     	add	x1, x1, #0x800
 464b864: aa1303e2     	mov	x2, x19
 464b868: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 464b86c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 464b870: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 464b874: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 464b878: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 464b87c: 9103c3ff     	add	sp, sp, #0xf0
 464b880: 15820d08     	b	0xa6ceca0 <_ChromeMain+0xa6c9a04>
