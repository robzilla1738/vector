
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d9b98: d102c3ff     	sub	sp, sp, #0xb0
 41d9b9c: a90857f6     	stp	x22, x21, [sp, #0x80]
 41d9ba0: a9094ff4     	stp	x20, x19, [sp, #0x90]
 41d9ba4: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 41d9ba8: 910283fd     	add	x29, sp, #0xa0
 41d9bac: aa0003f4     	mov	x20, x0
 41d9bb0: 39424015     	ldrb	w21, [x0, #0x90]
 41d9bb4: 972885ce     	bl	0xbfb2ec <_ChromeMain+0xbf6050>
 41d9bb8: f9403682     	ldr	x2, [x20, #0x68]
 41d9bbc: 528025c1     	mov	w1, #0x12e              ; =302
 41d9bc0: 97288573     	bl	0xbfb18c <_ChromeMain+0xbf5ef0>
 41d9bc4: b4000be0     	cbz	x0, 0x41d9d40 <_ChromeMain+0x41d4aa4>
 41d9bc8: aa0003f3     	mov	x19, x0
 41d9bcc: a93cffbf     	stp	xzr, xzr, [x29, #-0x38]
 41d9bd0: f81d83bf     	stur	xzr, [x29, #-0x28]
 41d9bd4: d00569a8     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 41d9bd8: f946f500     	ldr	x0, [x8, #0xde8]
 41d9bdc: b4000ce0     	cbz	x0, 0x41d9d78 <_ChromeMain+0x41d4adc>
 41d9be0: 710002bf     	cmp	w21, #0x0
 41d9be4: 528583c8     	mov	w8, #0x2c1e             ; =11294
 41d9be8: 1a880501     	cinc	w1, w8, ne
 41d9bec: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 41d9bf0: f90033ff     	str	xzr, [sp, #0x60]
 41d9bf4: 910143e8     	add	x8, sp, #0x50
 41d9bf8: 97436ab9     	bl	0x12b46dc <_ChromeMain+0x12af440>
 41d9bfc: d100e3a8     	sub	x8, x29, #0x38
 41d9c00: 910143e0     	add	x0, sp, #0x50
 41d9c04: 976d2e67     	bl	0x1d255a0 <_ChromeMain+0x1d20304>
 41d9c08: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 41d9c0c: 36f800a8     	tbz	w8, #0x1f, 0x41d9c20 <_ChromeMain+0x41d4984>
 41d9c10: f9402be0     	ldr	x0, [sp, #0x50]
 41d9c14: f94033e8     	ldr	x8, [sp, #0x60]
 41d9c18: d37ff901     	lsl	x1, x8, #1
 41d9c1c: 96f8bca7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d9c20: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 41d9c24: f90023ff     	str	xzr, [sp, #0x40]
 41d9c28: 38ddf3a8     	ldursb	w8, [x29, #-0x21]
 41d9c2c: 37f80608     	tbnz	w8, #0x1f, 0x41d9cec <_ChromeMain+0x41d4a50>
 41d9c30: 3cdc83a0     	ldur	q0, [x29, #-0x38]
 41d9c34: 3d800fe0     	str	q0, [sp, #0x30]
 41d9c38: f85d83a8     	ldur	x8, [x29, #-0x28]
 41d9c3c: f90023e8     	str	x8, [sp, #0x40]
 41d9c40: 528034e8     	mov	w8, #0x1a7              ; =423
 41d9c44: b90003e8     	str	w8, [sp]
 41d9c48: 390013ff     	strb	wzr, [sp, #0x4]
 41d9c4c: 90054160     	adrp	x0, 0xea05000 <dyld_stub_binder+0xea05000>
 41d9c50: 911f2000     	add	x0, x0, #0x7c8
 41d9c54: 910023e8     	add	x8, sp, #0x8
 41d9c58: 910003e1     	mov	x1, sp
 41d9c5c: 52800002     	mov	w2, #0x0                ; =0
 41d9c60: d2800003     	mov	x3, #0x0                ; =0
 41d9c64: 97306b2f     	bl	0xdf4920 <_ChromeMain+0xdef684>
 41d9c68: 910023e1     	add	x1, sp, #0x8
 41d9c6c: aa1303e0     	mov	x0, x19
 41d9c70: 976d2d26     	bl	0x1d25108 <_ChromeMain+0x1d1fe6c>
 41d9c74: 910023e0     	add	x0, sp, #0x8
 41d9c78: 9719b2f2     	bl	0x846840 <_ChromeMain+0x8415a4>
 41d9c7c: 389df3a8     	ldursb	x8, [x29, #-0x21]
 41d9c80: d100e3a9     	sub	x9, x29, #0x38
 41d9c84: a97cafaa     	ldp	x10, x11, [x29, #-0x38]
 41d9c88: f100011f     	cmp	x8, #0x0
 41d9c8c: 9a894141     	csel	x1, x10, x9, mi
 41d9c90: 7100011f     	cmp	w8, #0x0
 41d9c94: 9a884162     	csel	x2, x11, x8, mi
 41d9c98: aa1303e0     	mov	x0, x19
 41d9c9c: 976d2ddb     	bl	0x1d25408 <_ChromeMain+0x1d2016c>
 41d9ca0: 39811fe8     	ldrsb	x8, [sp, #0x47]
 41d9ca4: 9100c3e9     	add	x9, sp, #0x30
 41d9ca8: a9432fea     	ldp	x10, x11, [sp, #0x30]
 41d9cac: f100011f     	cmp	x8, #0x0
 41d9cb0: 9a894141     	csel	x1, x10, x9, mi
 41d9cb4: 7100011f     	cmp	w8, #0x0
 41d9cb8: 9a884162     	csel	x2, x11, x8, mi
 41d9cbc: aa1303e0     	mov	x0, x19
 41d9cc0: 976d2d6c     	bl	0x1d25270 <_ChromeMain+0x1d1ffd4>
 41d9cc4: b0054e80     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 41d9cc8: 9118e000     	add	x0, x0, #0x638
 41d9ccc: 96fcfd6d     	bl	0x119280 <_ChromeMain+0x113fe4>
 41d9cd0: 37000160     	tbnz	w0, #0x0, 0x41d9cfc <_ChromeMain+0x41d4a60>
 41d9cd4: b0054e80     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 41d9cd8: 91192000     	add	x0, x0, #0x648
 41d9cdc: 96fcfd69     	bl	0x119280 <_ChromeMain+0x113fe4>
 41d9ce0: 350000e0     	cbnz	w0, 0x41d9cfc <_ChromeMain+0x41d4a60>
 41d9ce4: 52800008     	mov	w8, #0x0                ; =0
 41d9ce8: 14000006     	b	0x41d9d00 <_ChromeMain+0x41d4a64>
 41d9cec: a97c8ba1     	ldp	x1, x2, [x29, #-0x38]
 41d9cf0: 9100c3e0     	add	x0, sp, #0x30
 41d9cf4: 96f9b3b7     	bl	0x46bd0 <_ChromeMain+0x41934>
 41d9cf8: 17ffffd2     	b	0x41d9c40 <_ChromeMain+0x41d49a4>
 41d9cfc: 39478288     	ldrb	w8, [x20, #0x1e0]
 41d9d00: 39430669     	ldrb	w9, [x19, #0xc1]
 41d9d04: 12000108     	and	w8, w8, #0x1
 41d9d08: 6b08013f     	cmp	w9, w8
 41d9d0c: 54000241     	b.ne	0x41d9d54 <_ChromeMain+0x41d4ab8>
 41d9d10: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 41d9d14: 36f800a8     	tbz	w8, #0x1f, 0x41d9d28 <_ChromeMain+0x41d4a8c>
 41d9d18: f9401be0     	ldr	x0, [sp, #0x30]
 41d9d1c: f94023e8     	ldr	x8, [sp, #0x40]
 41d9d20: d37ff901     	lsl	x1, x8, #1
 41d9d24: 96f8bc65     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d9d28: 38ddf3a8     	ldursb	w8, [x29, #-0x21]
 41d9d2c: 36f800a8     	tbz	w8, #0x1f, 0x41d9d40 <_ChromeMain+0x41d4aa4>
 41d9d30: f85c83a0     	ldur	x0, [x29, #-0x38]
 41d9d34: f85d83a8     	ldur	x8, [x29, #-0x28]
 41d9d38: d37ff901     	lsl	x1, x8, #1
 41d9d3c: 96f8bc5f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d9d40: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41d9d44: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41d9d48: a94857f6     	ldp	x22, x21, [sp, #0x80]
 41d9d4c: 9102c3ff     	add	sp, sp, #0xb0
 41d9d50: d65f03c0     	ret
 41d9d54: 39030668     	strb	w8, [x19, #0xc1]
 41d9d58: b9407a68     	ldr	w8, [x19, #0x78]
 41d9d5c: 7100051f     	cmp	w8, #0x1
 41d9d60: 5400012a     	b.ge	0x41d9d84 <_ChromeMain+0x41d4ae8>
 41d9d64: 3901f27f     	strb	wzr, [x19, #0x7c]
 41d9d68: aa1303e0     	mov	x0, x19
 41d9d6c: aa1303e1     	mov	x1, x19
 41d9d70: 97353898     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41d9d74: 17ffffe7     	b	0x41d9d10 <_ChromeMain+0x41d4a74>
 41d9d78: d4200000     	brk	#0
 41d9d7c: d4400000     	hlt	#0
 41d9d80: d4200020     	brk	#0x1
