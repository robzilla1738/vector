
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7839e0: f9400c00     	ldr	x0, [x0, #0x18]
 c7839e4: 529a0908     	mov	w8, #0xd048             ; =53320
 c7839e8: 6b08003f     	cmp	w1, w8
 c7839ec: 54000040     	b.eq	0xc7839f4 <_ChromeMain+0xc77e758>
 c7839f0: 17fd7b28     	b	0xc6e2690 <_ChromeMain+0xc6dd3f4>
 c7839f4: f9402000     	ldr	x0, [x0, #0x40]
 c7839f8: 1410b093     	b	0xcbafc44 <_ChromeMain+0xcbaa9a8>
 c7839fc: 529a0908     	mov	w8, #0xd048             ; =53320
 c783a00: 6b08003f     	cmp	w1, w8
 c783a04: 54000060     	b.eq	0xc783a10 <_ChromeMain+0xc77e774>
 c783a08: 52800020     	mov	w0, #0x1                ; =1
 c783a0c: d65f03c0     	ret
 c783a10: f9400c08     	ldr	x8, [x0, #0x18]
 c783a14: f9402100     	ldr	x0, [x8, #0x40]
 c783a18: 1410b08b     	b	0xcbafc44 <_ChromeMain+0xcbaa9a8>
 c783a1c: d10143ff     	sub	sp, sp, #0x50
 c783a20: a90257f6     	stp	x22, x21, [sp, #0x20]
 c783a24: a9034ff4     	stp	x20, x19, [sp, #0x30]
 c783a28: a9047bfd     	stp	x29, x30, [sp, #0x40]
 c783a2c: 910103fd     	add	x29, sp, #0x40
 c783a30: aa0103f3     	mov	x19, x1
 c783a34: 910003f4     	mov	x20, sp
 c783a38: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 c783a3c: 91002295     	add	x21, x20, #0x8
 c783a40: f90003f5     	str	x21, [sp]
 c783a44: b0007b01     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 c783a48: 913e7021     	add	x1, x1, #0xf9c
 c783a4c: 910003e0     	mov	x0, sp
 c783a50: 91006022     	add	x2, x1, #0x18
 c783a54: 94108bf8     	bl	0xcba6a34 <_ChromeMain+0xcba1798>
 c783a58: f94007e1     	ldr	x1, [sp, #0x8]
 c783a5c: b4000181     	cbz	x1, 0xc783a8c <_ChromeMain+0xc77e7f0>
 c783a60: aa0103e8     	mov	x8, x1
 c783a64: 14000003     	b	0xc783a70 <_ChromeMain+0xc77e7d4>
 c783a68: f9400108     	ldr	x8, [x8]
 c783a6c: b4000128     	cbz	x8, 0xc783a90 <_ChromeMain+0xc77e7f4>
 c783a70: b9401d09     	ldr	w9, [x8, #0x1c]
 c783a74: 6b09027f     	cmp	w19, w9
 c783a78: 54ffff8b     	b.lt	0xc783a68 <_ChromeMain+0xc77e7cc>
 c783a7c: 540000ad     	b.le	0xc783a90 <_ChromeMain+0xc77e7f4>
 c783a80: f9400508     	ldr	x8, [x8, #0x8]
 c783a84: b5ffff68     	cbnz	x8, 0xc783a70 <_ChromeMain+0xc77e7d4>
 c783a88: 14000002     	b	0xc783a90 <_ChromeMain+0xc77e7f4>
 c783a8c: d2800008     	mov	x8, #0x0                ; =0
 c783a90: f100011f     	cmp	x8, #0x0
 c783a94: fa551104     	ccmp	x8, x21, #0x4, ne
 c783a98: 1a9f07f3     	cset	w19, ne
 c783a9c: f9000ff4     	str	x20, [sp, #0x18]
 c783aa0: 910063e0     	add	x0, sp, #0x18
 c783aa4: 94100658     	bl	0xcb85404 <_ChromeMain+0xcb80168>
 c783aa8: aa1303e0     	mov	x0, x19
 c783aac: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 c783ab0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 c783ab4: a94257f6     	ldp	x22, x21, [sp, #0x20]
 c783ab8: 910143ff     	add	sp, sp, #0x50
 c783abc: d65f03c0     	ret
 c783ac0: d503201f     	nop
 c783ac4: d503201f     	nop
 c783ac8: d503201f     	nop
 c783acc: d503201f     	nop
 c783ad0: d503201f     	nop
 c783ad4: d503201f     	nop
 c783ad8: d503201f     	nop
 c783adc: d503201f     	nop
 c783ae0: d503201f     	nop
 c783ae4: d503201f     	nop
 c783ae8: d503201f     	nop
 c783aec: d503201f     	nop
		...
 c783b00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 c783b04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 c783b08: 910043fd     	add	x29, sp, #0x10
 c783b0c: aa0003f4     	mov	x20, x0
 c783b10: aa0803f3     	mov	x19, x8
 c783b14: 5290a188     	mov	w8, #0x850c             ; =34060
 c783b18: 6b08003f     	cmp	w1, w8
 c783b1c: 5400040c     	b.gt	0xc783b9c <_ChromeMain+0xc77e900>
 c783b20: 52909d88     	mov	w8, #0x84ec             ; =34028
 c783b24: 6b08003f     	cmp	w1, w8
 c783b28: 540009c0     	b.eq	0xc783c60 <_ChromeMain+0xc77e9c4>
 c783b2c: 5290a148     	mov	w8, #0x850a             ; =34058
 c783b30: 6b08003f     	cmp	w1, w8
 c783b34: 540001e0     	b.eq	0xc783b70 <_ChromeMain+0xc77e8d4>
 c783b38: 5290a188     	mov	w8, #0x850c             ; =34060
 c783b3c: 6b08003f     	cmp	w1, w8
 c783b40: 54000d41     	b.ne	0xc783ce8 <_ChromeMain+0xc77ea4c>
 c783b44: f9400e88     	ldr	x8, [x20, #0x18]
 c783b48: b4000ca8     	cbz	x8, 0xc783cdc <_ChromeMain+0xc77ea40>
 c783b4c: f0010881     	adrp	x1, 0xe896000 <dyld_stub_binder+0xe896000>
 c783b50: 913ae021     	add	x1, x1, #0xeb8
 c783b54: 91056100     	add	x0, x8, #0x158
 c783b58: 940ffbae     	bl	0xcb82a10 <_ChromeMain+0xcb7d774>
 c783b5c: b4000c00     	cbz	x0, 0xc783cdc <_ChromeMain+0xc77ea40>
 c783b60: 96d6d7c4     	bl	0x7d39a70 <_ChromeMain+0x7d347d4>
 c783b64: 7100001f     	cmp	w0, #0x0
 c783b68: 52858488     	mov	w8, #0x2c24             ; =11300
 c783b6c: 14000028     	b	0xc783c0c <_ChromeMain+0xc77e970>
 c783b70: f9400e88     	ldr	x8, [x20, #0x18]
 c783b74: b4000a88     	cbz	x8, 0xc783cc4 <_ChromeMain+0xc77ea28>
 c783b78: f0010881     	adrp	x1, 0xe896000 <dyld_stub_binder+0xe896000>
 c783b7c: 913ae021     	add	x1, x1, #0xeb8
 c783b80: 91056100     	add	x0, x8, #0x158
 c783b84: 940ffba3     	bl	0xcb82a10 <_ChromeMain+0xcb7d774>
 c783b88: b40009e0     	cbz	x0, 0xc783cc4 <_ChromeMain+0xc77ea28>
 c783b8c: 9410ada3     	bl	0xcbaf218 <_ChromeMain+0xcba9f7c>
 c783b90: 7100001f     	cmp	w0, #0x0
 c783b94: 52858388     	mov	w8, #0x2c1c             ; =11292
 c783b98: 1400001d     	b	0xc783c0c <_ChromeMain+0xc77e970>
 c783b9c: 5290a1a8     	mov	w8, #0x850d             ; =34061
 c783ba0: 6b08003f     	cmp	w1, w8
 c783ba4: 54000200     	b.eq	0xc783be4 <_ChromeMain+0xc77e948>
 c783ba8: 529a0908     	mov	w8, #0xd048             ; =53320
 c783bac: 6b08003f     	cmp	w1, w8
 c783bb0: 54000381     	b.ne	0xc783c20 <_ChromeMain+0xc77e984>
 c783bb4: f9400e88     	ldr	x8, [x20, #0x18]
 c783bb8: f9402100     	ldr	x0, [x8, #0x40]
 c783bbc: f9400008     	ldr	x8, [x0]
 c783bc0: f940b508     	ldr	x8, [x8, #0x168]
 c783bc4: d63f0100     	blr	x8
 c783bc8: f0003b01     	adrp	x1, 0xcee6000 <dyld_stub_binder+0xcee6000>
 c783bcc: 91087821     	add	x1, x1, #0x21e
 c783bd0: 528002e2     	mov	w2, #0x17               ; =23
 c783bd4: 940ffc28     	bl	0xcb82c74 <_ChromeMain+0xcb7d9d8>
 c783bd8: 7100001f     	cmp	w0, #0x0
 c783bdc: 52810fa8     	mov	w8, #0x87d              ; =2173
 c783be0: 1400000b     	b	0xc783c0c <_ChromeMain+0xc77e970>
 c783be4: f9400e88     	ldr	x8, [x20, #0x18]
 c783be8: b4000748     	cbz	x8, 0xc783cd0 <_ChromeMain+0xc77ea34>
 c783bec: f0010881     	adrp	x1, 0xe896000 <dyld_stub_binder+0xe896000>
 c783bf0: 913ae021     	add	x1, x1, #0xeb8
 c783bf4: 91056100     	add	x0, x8, #0x158
 c783bf8: 940ffb86     	bl	0xcb82a10 <_ChromeMain+0xcb7d774>
 c783bfc: b40006a0     	cbz	x0, 0xc783cd0 <_ChromeMain+0xc77ea34>
 c783c00: 9410b014     	bl	0xcbafc50 <_ChromeMain+0xcbaa9b4>
 c783c04: 7100001f     	cmp	w0, #0x0
 c783c08: 528583c8     	mov	w8, #0x2c1e             ; =11294
 c783c0c: 1a880500     	cinc	w0, w8, ne
 c783c10: aa1303e8     	mov	x8, x19
 c783c14: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 c783c18: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 c783c1c: 141015f3     	b	0xcb893e8 <_ChromeMain+0xcb8414c>
 c783c20: 529a0928     	mov	w8, #0xd049             ; =53321
 c783c24: 6b08003f     	cmp	w1, w8
 c783c28: 54000601     	b.ne	0xc783ce8 <_ChromeMain+0xc77ea4c>
 c783c2c: f9400e88     	ldr	x8, [x20, #0x18]
 c783c30: f9402100     	ldr	x0, [x8, #0x40]
 c783c34: f9400008     	ldr	x8, [x0]
 c783c38: f940b508     	ldr	x8, [x8, #0x168]
 c783c3c: d63f0100     	blr	x8
 c783c40: d0003b01     	adrp	x1, 0xcee5000 <dyld_stub_binder+0xcee5000>
 c783c44: 912b0c21     	add	x1, x1, #0xac3
 c783c48: 528003a2     	mov	w2, #0x1d               ; =29
 c783c4c: 940ffc0a     	bl	0xcb82c74 <_ChromeMain+0xcb7d9d8>
 c783c50: 7100001f     	cmp	w0, #0x0
 c783c54: 52858788     	mov	w8, #0x2c3c             ; =11324
 c783c58: 1a881500     	cinc	w0, w8, eq
 c783c5c: 17ffffed     	b	0xc783c10 <_ChromeMain+0xc77e974>
 c783c60: f9400e80     	ldr	x0, [x20, #0x18]
 c783c64: 52909d81     	mov	w1, #0x84ec             ; =34028
 c783c68: 97fd7a8a     	bl	0xc6e2690 <_ChromeMain+0xc6dd3f4>
 c783c6c: 35000060     	cbnz	w0, 0xc783c78 <_ChromeMain+0xc77e9dc>
 c783c70: 52846680     	mov	w0, #0x2334             ; =9012
 c783c74: 17ffffe7     	b	0xc783c10 <_ChromeMain+0xc77e974>
 c783c78: f9400e88     	ldr	x8, [x20, #0x18]
 c783c7c: f9402100     	ldr	x0, [x8, #0x40]
 c783c80: 9410a7b7     	bl	0xcbadb5c <_ChromeMain+0xcba88c0>
 c783c84: aa0003f4     	mov	x20, x0
 c783c88: f9400800     	ldr	x0, [x0, #0x10]
 c783c8c: b4000040     	cbz	x0, 0xc783c94 <_ChromeMain+0xc77e9f8>
 c783c90: 9410aff3     	bl	0xcbafc5c <_ChromeMain+0xcbaa9c0>
 c783c94: f9402688     	ldr	x8, [x20, #0x48]
 c783c98: 52846680     	mov	w0, #0x2334             ; =9012
 c783c9c: b4fffba8     	cbz	x8, 0xc783c10 <_ChromeMain+0xc77e974>
 c783ca0: f9402288     	ldr	x8, [x20, #0x40]
 c783ca4: f9400908     	ldr	x8, [x8, #0x10]
 c783ca8: b9401108     	ldr	w8, [x8, #0x10]
 c783cac: 51000509     	sub	w9, w8, #0x1
 c783cb0: 5284670a     	mov	w10, #0x2338            ; =9016
 c783cb4: 4b080148     	sub	w8, w10, w8
 c783cb8: 71000d3f     	cmp	w9, #0x3
 c783cbc: 1a803100     	csel	w0, w8, w0, lo
 c783cc0: 17ffffd4     	b	0xc783c10 <_ChromeMain+0xc77e974>
 c783cc4: d4200000     	brk	#0
 c783cc8: d4400000     	hlt	#0
 c783ccc: d4200020     	brk	#0x1
 c783cd0: d4200000     	brk	#0
 c783cd4: d4400000     	hlt	#0
 c783cd8: d4200020     	brk	#0x1
 c783cdc: d4200000     	brk	#0
 c783ce0: d4400000     	hlt	#0
 c783ce4: d4200020     	brk	#0x1
 c783ce8: d4200000     	brk	#0
 c783cec: d4400000     	hlt	#0
 c783cf0: d4200020     	brk	#0x1
