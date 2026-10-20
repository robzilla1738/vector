
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1a42a1c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 1a42a20: a9014ff4     	stp	x20, x19, [sp, #0x10]
 1a42a24: a9027bfd     	stp	x29, x30, [sp, #0x20]
 1a42a28: 910083fd     	add	x29, sp, #0x20
 1a42a2c: aa0103f3     	mov	x19, x1
 1a42a30: aa0003f4     	mov	x20, x0
 1a42a34: 91008000     	add	x0, x0, #0x20
 1a42a38: 528000e1     	mov	w1, #0x7                ; =7
 1a42a3c: 52800022     	mov	w2, #0x1                ; =1
 1a42a40: 97c74cf0     	bl	0xc15e00 <_ChromeMain+0xc10b64>
 1a42a44: aa0003f5     	mov	x21, x0
 1a42a48: 91008260     	add	x0, x19, #0x20
 1a42a4c: 528000e1     	mov	w1, #0x7                ; =7
 1a42a50: 52800022     	mov	w2, #0x1                ; =1
 1a42a54: 97c74ceb     	bl	0xc15e00 <_ChromeMain+0xc10b64>
 1a42a58: 39805e88     	ldrsb	x8, [x20, #0x17]
 1a42a5c: b6f80048     	tbz	x8, #0x3f, 0x1a42a64 <_ChromeMain+0x1a3d7c8>
 1a42a60: a9402294     	ldp	x20, x8, [x20]
 1a42a64: 93407ea9     	sxtw	x9, w21
 1a42a68: eb35c11f     	cmp	x8, w21, sxtw
 1a42a6c: 9a893102     	csel	x2, x8, x9, lo
 1a42a70: 39805e68     	ldrsb	x8, [x19, #0x17]
 1a42a74: b6f80048     	tbz	x8, #0x3f, 0x1a42a7c <_ChromeMain+0x1a3d7e0>
 1a42a78: a9402273     	ldp	x19, x8, [x19]
 1a42a7c: 93407c09     	sxtw	x9, w0
 1a42a80: eb20c11f     	cmp	x8, w0, sxtw
 1a42a84: 9a893108     	csel	x8, x8, x9, lo
 1a42a88: eb08005f     	cmp	x2, x8
 1a42a8c: 540000c0     	b.eq	0x1a42aa4 <_ChromeMain+0x1a3d808>
 1a42a90: 52800000     	mov	w0, #0x0                ; =0
 1a42a94: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 1a42a98: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 1a42a9c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 1a42aa0: d65f03c0     	ret
 1a42aa4: aa1403e0     	mov	x0, x20
 1a42aa8: aa1303e1     	mov	x1, x19
 1a42aac: 95971b6d     	bl	0x8009860 <_ChromeMain+0x80045c4>
 1a42ab0: 7100001f     	cmp	w0, #0x0
 1a42ab4: 1a9f17e0     	cset	w0, eq
 1a42ab8: 17fffff7     	b	0x1a42a94 <_ChromeMain+0x1a3d7f8>
