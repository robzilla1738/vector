
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4650a04: d101c3ff     	sub	sp, sp, #0x70
 4650a08: a90457f6     	stp	x22, x21, [sp, #0x40]
 4650a0c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4650a10: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4650a14: 910183fd     	add	x29, sp, #0x60
 4650a18: 397e4008     	ldrb	w8, [x0, #0xf90]
 4650a1c: 370013a8     	tbnz	w8, #0x0, 0x4650c90 <_ChromeMain+0x464b9f4>
 4650a20: aa0103f3     	mov	x19, x1
 4650a24: aa0003f4     	mov	x20, x0
 4650a28: f9435400     	ldr	x0, [x0, #0x6a8]
 4650a2c: b4000460     	cbz	x0, 0x4650ab8 <_ChromeMain+0x464b81c>
 4650a30: 39683288     	ldrb	w8, [x20, #0xa0c]
 4650a34: 350001c8     	cbnz	w8, 0x4650a6c <_ChromeMain+0x464b7d0>
 4650a38: b948ca88     	ldr	w8, [x20, #0x8c8]
 4650a3c: 14000011     	b	0x4650a80 <_ChromeMain+0x464b7e4>
 4650a40: eb0a013f     	cmp	x9, x10
 4650a44: 540013c0     	b.eq	0x4650cbc <_ChromeMain+0x464ba20>
 4650a48: f9401929     	ldr	x9, [x9, #0x30]
 4650a4c: b4000309     	cbz	x9, 0x4650aac <_ChromeMain+0x464b810>
 4650a50: b940052a     	ldr	w10, [x9, #0x4]
 4650a54: b9400d29     	ldr	w9, [x9, #0xc]
 4650a58: 0b0a0129     	add	w9, w9, w10
 4650a5c: 14000014     	b	0x4650aac <_ChromeMain+0x464b810>
 4650a60: f9400129     	ldr	x9, [x9]
 4650a64: b5000189     	cbnz	x9, 0x4650a94 <_ChromeMain+0x464b7f8>
 4650a68: 14000011     	b	0x4650aac <_ChromeMain+0x464b810>
 4650a6c: f9442688     	ldr	x8, [x20, #0x848]
 4650a70: b9409508     	ldr	w8, [x8, #0x94]
 4650a74: 52802309     	mov	w9, #0x118              ; =280
 4650a78: 7104611f     	cmp	w8, #0x118
 4650a7c: 1a89c108     	csel	w8, w8, w9, gt
 4650a80: aa0003ea     	mov	x10, x0
 4650a84: f84e8d49     	ldr	x9, [x10, #0xe8]!
 4650a88: b4000129     	cbz	x9, 0x4650aac <_ChromeMain+0x464b810>
 4650a8c: b0051dab     	adrp	x11, 0xea05000 <dyld_stub_binder+0xea05000>
 4650a90: 9112216b     	add	x11, x11, #0x488
 4650a94: f940112c     	ldr	x12, [x9, #0x20]
 4650a98: eb0b019f     	cmp	x12, x11
 4650a9c: 54fffe28     	b.hi	0x4650a60 <_ChromeMain+0x464b7c4>
 4650aa0: 54fffd02     	b.hs	0x4650a40 <_ChromeMain+0x464b7a4>
 4650aa4: f9400529     	ldr	x9, [x9, #0x8]
 4650aa8: b5ffff69     	cbnz	x9, 0x4650a94 <_ChromeMain+0x464b7f8>
 4650aac: 4b090108     	sub	w8, w8, w9
 4650ab0: b2600101     	orr	x1, x8, #0x100000000
 4650ab4: 97fed673     	bl	0x4606480 <_ChromeMain+0x46011e4>
 4650ab8: 39282293     	strb	w19, [x20, #0xa08]
 4650abc: aa1403e0     	mov	x0, x20
 4650ac0: 979d0e7c     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 4650ac4: aa1403e0     	mov	x0, x20
 4650ac8: 52800021     	mov	w1, #0x1                ; =1
 4650acc: 97ffe77d     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 4650ad0: aa1403e0     	mov	x0, x20
 4650ad4: 52800001     	mov	w1, #0x0                ; =0
 4650ad8: 96ff7e67     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4650adc: f9422e88     	ldr	x8, [x20, #0x458]
 4650ae0: 9107c100     	add	x0, x8, #0x1f0
 4650ae4: 52800001     	mov	w1, #0x0                ; =0
 4650ae8: 96ff7e63     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4650aec: 39683288     	ldrb	w8, [x20, #0xa0c]
 4650af0: 34000273     	cbz	w19, 0x4650b3c <_ChromeMain+0x464b8a0>
 4650af4: 34000068     	cbz	w8, 0x4650b00 <_ChromeMain+0x464b864>
 4650af8: aa1403e0     	mov	x0, x20
 4650afc: 97fffed1     	bl	0x4650640 <_ChromeMain+0x464b3a4>
 4650b00: b0052b08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4650b04: f9468d08     	ldr	x8, [x8, #0xd18]
 4650b08: d63f0100     	blr	x8
 4650b0c: 912fc288     	add	x8, x20, #0xbf0
 4650b10: 396fe289     	ldrb	w9, [x20, #0xbf8]
 4650b14: 350000c9     	cbnz	w9, 0x4650b2c <_ChromeMain+0x464b890>
 4650b18: b4000ce8     	cbz	x8, 0x4650cb4 <_ChromeMain+0x464ba18>
 4650b1c: f905fa80     	str	x0, [x20, #0xbf0]
 4650b20: 52800028     	mov	w8, #0x1                ; =1
 4650b24: 392fe288     	strb	w8, [x20, #0xbf8]
 4650b28: 14000002     	b	0x4650b30 <_ChromeMain+0x464b894>
 4650b2c: f9000100     	str	x0, [x8]
 4650b30: f004c3c8     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4650b34: 913c8908     	add	x8, x8, #0xf22
 4650b38: 1400001f     	b	0x4650bb4 <_ChromeMain+0x464b918>
 4650b3c: 34000068     	cbz	w8, 0x4650b48 <_ChromeMain+0x464b8ac>
 4650b40: 91268280     	add	x0, x20, #0x9a0
 4650b44: 970376f5     	bl	0x72e718 <_ChromeMain+0x72947c>
 4650b48: 396fe288     	ldrb	w8, [x20, #0xbf8]
 4650b4c: 34000308     	cbz	w8, 0x4650bac <_ChromeMain+0x464b910>
 4650b50: b0052b08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4650b54: f9468d08     	ldr	x8, [x8, #0xd18]
 4650b58: d63f0100     	blr	x8
 4650b5c: 396fe288     	ldrb	w8, [x20, #0xbf8]
 4650b60: 36000ac8     	tbz	w8, #0x0, 0x4650cb8 <_ChromeMain+0x464ba1c>
 4650b64: f945fa88     	ldr	x8, [x20, #0xbf0]
 4650b68: eb080008     	subs	x8, x0, x8
 4650b6c: 937ffd09     	asr	x9, x8, #63
 4650b70: d2410129     	eor	x9, x9, #0x8000000000000000
 4650b74: 9a886135     	csel	x21, x9, x8, vs
 4650b78: f004c3c0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4650b7c: 913d0800     	add	x0, x0, #0xf42
 4650b80: 52807d01     	mov	w1, #0x3e8              ; =1000
 4650b84: 52948002     	mov	w2, #0xa400             ; =41984
 4650b88: 72bad262     	movk	w2, #0xd693, lsl #16
 4650b8c: 52800643     	mov	w3, #0x32               ; =50
 4650b90: 52800024     	mov	w4, #0x1                ; =1
 4650b94: 9707311e     	bl	0x81d00c <_ChromeMain+0x817d70>
 4650b98: aa1503e1     	mov	x1, x21
 4650b9c: 96f91039     	bl	0x494c80 <_ChromeMain+0x48f9e4>
 4650ba0: 396fe288     	ldrb	w8, [x20, #0xbf8]
 4650ba4: 34000048     	cbz	w8, 0x4650bac <_ChromeMain+0x464b910>
 4650ba8: 392fe29f     	strb	wzr, [x20, #0xbf8]
 4650bac: f004c3c8     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4650bb0: 913dbd08     	add	x8, x8, #0xf6f
 4650bb4: f81d83a8     	stur	x8, [x29, #-0x28]
 4650bb8: d100a3a0     	sub	x0, x29, #0x28
 4650bbc: 975276ec     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4650bc0: f9422e88     	ldr	x8, [x20, #0x458]
 4650bc4: f9429d08     	ldr	x8, [x8, #0x538]
 4650bc8: 9100a109     	add	x9, x8, #0x28
 4650bcc: f100011f     	cmp	x8, #0x0
 4650bd0: 9a8903e9     	csel	x9, xzr, x9, eq
 4650bd4: f940b128     	ldr	x8, [x9, #0x160]
 4650bd8: d0052b15     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4650bdc: b40002e8     	cbz	x8, 0x4650c38 <_ChromeMain+0x464b99c>
 4650be0: 91058129     	add	x9, x9, #0x160
 4650be4: f005114a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4650be8: 9108614a     	add	x10, x10, #0x218
 4650bec: 1400000d     	b	0x4650c20 <_ChromeMain+0x464b984>
 4650bf0: eb09011f     	cmp	x8, x9
 4650bf4: 54000220     	b.eq	0x4650c38 <_ChromeMain+0x464b99c>
 4650bf8: f9401514     	ldr	x20, [x8, #0x28]
 4650bfc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4650c00: f94046a9     	ldr	x9, [x21, #0x88]
 4650c04: eb09011f     	cmp	x8, x9
 4650c08: 540001a1     	b.ne	0x4650c3c <_ChromeMain+0x464b9a0>
 4650c0c: aa1403e0     	mov	x0, x20
 4650c10: 96e70dbb     	bl	0x142fc <_ChromeMain+0xf060>
 4650c14: 1400000a     	b	0x4650c3c <_ChromeMain+0x464b9a0>
 4650c18: f9400108     	ldr	x8, [x8]
 4650c1c: b40000e8     	cbz	x8, 0x4650c38 <_ChromeMain+0x464b99c>
 4650c20: f940110b     	ldr	x11, [x8, #0x20]
 4650c24: eb0a017f     	cmp	x11, x10
 4650c28: 54ffff88     	b.hi	0x4650c18 <_ChromeMain+0x464b97c>
 4650c2c: 54fffe20     	b.eq	0x4650bf0 <_ChromeMain+0x464b954>
 4650c30: f9400508     	ldr	x8, [x8, #0x8]
 4650c34: b5ffff68     	cbnz	x8, 0x4650c20 <_ChromeMain+0x464b984>
 4650c38: d2800014     	mov	x20, #0x0               ; =0
 4650c3c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4650c40: f94046a9     	ldr	x9, [x21, #0x88]
 4650c44: eb09011f     	cmp	x8, x9
 4650c48: 540002e0     	b.eq	0x4650ca4 <_ChromeMain+0x464ba08>
 4650c4c: b4000234     	cbz	x20, 0x4650c90 <_ChromeMain+0x464b9f4>
 4650c50: f0051148     	adrp	x8, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4650c54: 910ac108     	add	x8, x8, #0x2b0
 4650c58: f0051149     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4650c5c: 910aa129     	add	x9, x9, #0x2a8
 4650c60: 390083ff     	strb	wzr, [sp, #0x20]
 4650c64: 3900c3ff     	strb	wzr, [sp, #0x30]
 4650c68: 7100027f     	cmp	w19, #0x0
 4650c6c: 9a881122     	csel	x2, x9, x8, ne
 4650c70: 390023ff     	strb	wzr, [sp, #0x8]
 4650c74: 390063ff     	strb	wzr, [sp, #0x18]
 4650c78: f0051141     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4650c7c: 910a4021     	add	x1, x1, #0x290
 4650c80: 910083e3     	add	x3, sp, #0x20
 4650c84: 910023e4     	add	x4, sp, #0x8
 4650c88: aa1403e0     	mov	x0, x20
 4650c8c: 94c2be64     	bl	0x770061c <_ChromeMain+0x76fb380>
 4650c90: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4650c94: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4650c98: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4650c9c: 9101c3ff     	add	sp, sp, #0x70
 4650ca0: d65f03c0     	ret
 4650ca4: aa1403e0     	mov	x0, x20
 4650ca8: 96e74765     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4650cac: b5fffd34     	cbnz	x20, 0x4650c50 <_ChromeMain+0x464b9b4>
 4650cb0: 17fffff8     	b	0x4650c90 <_ChromeMain+0x464b9f4>
 4650cb4: d4200020     	brk	#0x1
 4650cb8: 9416bd99     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4650cbc: 52800009     	mov	w9, #0x0                ; =0
 4650cc0: 17ffff7b     	b	0x4650aac <_ChromeMain+0x464b810>
