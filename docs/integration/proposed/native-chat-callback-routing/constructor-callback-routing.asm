
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e1a00: f9436a60     	ldr	x0, [x19, #0x6d0]
 37e1a04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e1a08: f9404789     	ldr	x9, [x28, #0x88]
 37e1a0c: eb09011f     	cmp	x8, x9
 37e1a10: 54000041     	b.ne	0x37e1a18 <_ChromeMain+0x37dc77c>
 37e1a14: 9721040a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e1a18: f9036a74     	str	x20, [x19, #0x6d0]
 37e1a1c: f9400288     	ldr	x8, [x20]
 37e1a20: f9405108     	ldr	x8, [x8, #0xa0]
 37e1a24: aa1403e0     	mov	x0, x20
 37e1a28: 52800001     	mov	w1, #0x0                ; =0
 37e1a2c: d63f0100     	blr	x8
 37e1a30: 925e7677     	and	x23, x19, #0xfffffffc00000000
 37e1a34: f9404788     	ldr	x8, [x28, #0x88]
 37e1a38: eb0802ff     	cmp	x23, x8
 37e1a3c: 54000061     	b.ne	0x37e1a48 <_ChromeMain+0x37dc7ac>
 37e1a40: aa1303e0     	mov	x0, x19
 37e1a44: 9720ca2e     	bl	0x142fc <_ChromeMain+0xf060>
 37e1a48: 52800700     	mov	w0, #0x38               ; =56
 37e1a4c: 9720b647     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1a50: aa0003f5     	mov	x21, x0
 37e1a54: 5280003b     	mov	w27, #0x1               ; =1
 37e1a58: b900001b     	str	w27, [x0]
 37e1a5c: b0007454     	adrp	x20, 0x466a000 <_ChromeMain+0x4664d64>
 37e1a60: 91368294     	add	x20, x20, #0xda0
 37e1a64: 105c06f6     	adr	x22, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1a68: d503201f     	nop
 37e1a6c: a900d814     	stp	x20, x22, [x0, #0x8]
 37e1a70: 90007268     	adrp	x8, 0x462d000 <_ChromeMain+0x4627d64>
 37e1a74: 91267108     	add	x8, x8, #0x99c
 37e1a78: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e1a7c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1a80: f9404788     	ldr	x8, [x28, #0x88]
 37e1a84: eb0802ff     	cmp	x23, x8
 37e1a88: 54000061     	b.ne	0x37e1a94 <_ChromeMain+0x37dc7f8>
 37e1a8c: aa1303e0     	mov	x0, x19
 37e1a90: 9720ca1b     	bl	0x142fc <_ChromeMain+0xf060>
 37e1a94: 52800700     	mov	w0, #0x38               ; =56
 37e1a98: 9720b634     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1a9c: aa0003fa     	mov	x26, x0
 37e1aa0: b900001b     	str	w27, [x0]
 37e1aa4: a900d814     	stp	x20, x22, [x0, #0x8]
 37e1aa8: b0007268     	adrp	x8, 0x462e000 <_ChromeMain+0x4628d64>
 37e1aac: 9112f108     	add	x8, x8, #0x4bc
 37e1ab0: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1ab4: 912c0129     	add	x9, x9, #0xb00
 37e1ab8: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1abc: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1ac0: 925e767c     	and	x28, x19, #0xfffffffc00000000
 37e1ac4: b0059e88     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1ac8: f9404508     	ldr	x8, [x8, #0x88]
 37e1acc: eb08039f     	cmp	x28, x8
 37e1ad0: 54000061     	b.ne	0x37e1adc <_ChromeMain+0x37dc840>
 37e1ad4: aa1303e0     	mov	x0, x19
 37e1ad8: 9720ca09     	bl	0x142fc <_ChromeMain+0xf060>
 37e1adc: 52800700     	mov	w0, #0x38               ; =56
 37e1ae0: 9720b622     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1ae4: aa0003fb     	mov	x27, x0
 37e1ae8: 52800037     	mov	w23, #0x1               ; =1
 37e1aec: b9000017     	str	w23, [x0]
 37e1af0: a900d814     	stp	x20, x22, [x0, #0x8]
 37e1af4: b0007268     	adrp	x8, 0x462e000 <_ChromeMain+0x4628d64>
 37e1af8: 91276108     	add	x8, x8, #0x9d8
 37e1afc: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1b00: 912c0129     	add	x9, x9, #0xb00
 37e1b04: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1b08: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1b0c: b0059e88     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1b10: f9404508     	ldr	x8, [x8, #0x88]
 37e1b14: eb08039f     	cmp	x28, x8
 37e1b18: 54000061     	b.ne	0x37e1b24 <_ChromeMain+0x37dc888>
 37e1b1c: aa1303e0     	mov	x0, x19
 37e1b20: 9720c9f7     	bl	0x142fc <_ChromeMain+0xf060>
 37e1b24: 52800700     	mov	w0, #0x38               ; =56
 37e1b28: 9720b610     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1b2c: aa0003fc     	mov	x28, x0
 37e1b30: b0007448     	adrp	x8, 0x466a000 <_ChromeMain+0x4664d64>
 37e1b34: 9138c108     	add	x8, x8, #0xe30
 37e1b38: 105c0049     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1b3c: d503201f     	nop
 37e1b40: b9000017     	str	w23, [x0]
 37e1b44: a900a408     	stp	x8, x9, [x0, #0x8]
 37e1b48: b0007268     	adrp	x8, 0x462e000 <_ChromeMain+0x4628d64>
 37e1b4c: 9128c108     	add	x8, x8, #0xa30
 37e1b50: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1b54: 912c0129     	add	x9, x9, #0xb00
 37e1b58: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1b5c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1b60: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e1b64: b0059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1b68: f9404529     	ldr	x9, [x9, #0x88]
 37e1b6c: eb09011f     	cmp	x8, x9
 37e1b70: 54000061     	b.ne	0x37e1b7c <_ChromeMain+0x37dc8e0>
 37e1b74: aa1303e0     	mov	x0, x19
 37e1b78: 9720c9e1     	bl	0x142fc <_ChromeMain+0xf060>
 37e1b7c: 52800700     	mov	w0, #0x38               ; =56
 37e1b80: 9720b5fa     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1b84: 52800028     	mov	w8, #0x1                ; =1
 37e1b88: b9000008     	str	w8, [x0]
 37e1b8c: 90047d28     	adrp	x8, 0xc785000 <_ChromeMain+0xc77fd64>
 37e1b90: 9126a108     	add	x8, x8, #0x9a8
 37e1b94: 90003ac9     	adrp	x9, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1b98: 913a012a     	add	x10, x9, #0xe80
 37e1b9c: 105bfd29     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1ba0: d503201f     	nop
 37e1ba4: a900a40a     	stp	x10, x9, [x0, #0x8]
 37e1ba8: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1bac: 912c0129     	add	x9, x9, #0xb00
 37e1bb0: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1bb4: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1bb8: f9422e68     	ldr	x8, [x19, #0x458]
 37e1bbc: f9001be0     	str	x0, [sp, #0x30]
 37e1bc0: b40002c8     	cbz	x8, 0x37e1c18 <_ChromeMain+0x37dc97c>
 37e1bc4: f9429d08     	ldr	x8, [x8, #0x538]
 37e1bc8: f9403500     	ldr	x0, [x8, #0x68]
 37e1bcc: b4000260     	cbz	x0, 0x37e1c18 <_ChromeMain+0x37dc97c>
 37e1bd0: f9400008     	ldr	x8, [x0]
 37e1bd4: f940a508     	ldr	x8, [x8, #0x148]
 37e1bd8: d63f0100     	blr	x8
 37e1bdc: f9400008     	ldr	x8, [x0]
 37e1be0: f940b508     	ldr	x8, [x8, #0x168]
 37e1be4: d63f0100     	blr	x8
 37e1be8: b4000180     	cbz	x0, 0x37e1c18 <_ChromeMain+0x37dc97c>
 37e1bec: b004b841     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 37e1bf0: 91187021     	add	x1, x1, #0x61c
 37e1bf4: 52800542     	mov	w2, #0x2a               ; =42
 37e1bf8: 972c9242     	bl	0x306500 <_ChromeMain+0x301264>
 37e1bfc: b9002fe0     	str	w0, [sp, #0x2c]
 37e1c00: 14000008     	b	0x37e1c20 <_ChromeMain+0x37dc984>
 37e1c04: eb09011f     	cmp	x8, x9
 37e1c08: 54006920     	b.eq	0x37e292c <_ChromeMain+0x37dd690>
 37e1c0c: f9401914     	ldr	x20, [x8, #0x30]
 37e1c10: 14000348     	b	0x37e2930 <_ChromeMain+0x37dd694>
 37e1c14: d4200020     	brk	#0x1
 37e1c18: 52800028     	mov	w8, #0x1                ; =1
 37e1c1c: b9002fe8     	str	w8, [sp, #0x2c]
 37e1c20: 925e7676     	and	x22, x19, #0xfffffffc00000000
 37e1c24: b0059e88     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1c28: f9404508     	ldr	x8, [x8, #0x88]
 37e1c2c: eb0802df     	cmp	x22, x8
 37e1c30: 54000061     	b.ne	0x37e1c3c <_ChromeMain+0x37dc9a0>
 37e1c34: aa1303e0     	mov	x0, x19
 37e1c38: 9720c9b1     	bl	0x142fc <_ChromeMain+0xf060>
 37e1c3c: 52800700     	mov	w0, #0x38               ; =56
 37e1c40: 9720b5ca     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1c44: aa0003f4     	mov	x20, x0
 37e1c48: b9000017     	str	w23, [x0]
 37e1c4c: 105bf7a8     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1c50: d503201f     	nop
 37e1c54: a900a018     	stp	x24, x8, [x0, #0x8]
 37e1c58: d0007268     	adrp	x8, 0x462f000 <_ChromeMain+0x4629d64>
 37e1c5c: 910be108     	add	x8, x8, #0x2f8
 37e1c60: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1c64: 912c0129     	add	x9, x9, #0xb00
 37e1c68: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1c6c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1c70: b0059e88     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1c74: f9404508     	ldr	x8, [x8, #0x88]
 37e1c78: eb0802df     	cmp	x22, x8
 37e1c7c: 54000061     	b.ne	0x37e1c88 <_ChromeMain+0x37dc9ec>
 37e1c80: aa1303e0     	mov	x0, x19
 37e1c84: 9720c99e     	bl	0x142fc <_ChromeMain+0xf060>
 37e1c88: 52800700     	mov	w0, #0x38               ; =56
 37e1c8c: 9720b5b7     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1c90: aa0003f8     	mov	x24, x0
 37e1c94: b9000017     	str	w23, [x0]
 37e1c98: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1c9c: 913a0109     	add	x9, x8, #0xe80
 37e1ca0: 105bf508     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1ca4: d503201f     	nop
 37e1ca8: a900a009     	stp	x9, x8, [x0, #0x8]
 37e1cac: d0007268     	adrp	x8, 0x462f000 <_ChromeMain+0x4629d64>
 37e1cb0: 910f6108     	add	x8, x8, #0x3d8
 37e1cb4: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1cb8: 912c0129     	add	x9, x9, #0xb00
 37e1cbc: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1cc0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1cc4: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e1cc8: b0059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1ccc: f9404529     	ldr	x9, [x9, #0x88]
 37e1cd0: eb09011f     	cmp	x8, x9
 37e1cd4: b005b956     	adrp	x22, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e1cd8: 911202d6     	add	x22, x22, #0x480
 37e1cdc: 54000061     	b.ne	0x37e1ce8 <_ChromeMain+0x37dca4c>
 37e1ce0: aa1303e0     	mov	x0, x19
 37e1ce4: 9720c986     	bl	0x142fc <_ChromeMain+0xf060>
 37e1ce8: 52800700     	mov	w0, #0x38               ; =56
 37e1cec: 9720b59f     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1cf0: aa0003f7     	mov	x23, x0
 37e1cf4: 52800028     	mov	w8, #0x1                ; =1
 37e1cf8: b9000008     	str	w8, [x0]
 37e1cfc: d0007268     	adrp	x8, 0x462f000 <_ChromeMain+0x4629d64>
 37e1d00: 912ce108     	add	x8, x8, #0xb38
 37e1d04: 90003ec9     	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 37e1d08: 910c012a     	add	x10, x9, #0x300
 37e1d0c: 105bf1a9     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1d10: d503201f     	nop
 37e1d14: a900a40a     	stp	x10, x9, [x0, #0x8]
 37e1d18: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1d1c: 912c0129     	add	x9, x9, #0xb00
 37e1d20: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1d24: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e1d28: f8bfc2c0     	ldapr	x0, [x22]
 37e1d2c: b401bc00     	cbz	x0, 0x37e54ac <_ChromeMain+0x37e0210>
 37e1d30: 52808801     	mov	w1, #0x440              ; =1088
 37e1d34: d2800002     	mov	x2, #0x0                ; =0
 37e1d38: 9723261e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e1d3c: d0057a36     	adrp	x22, 0xe727000 <dyld_stub_binder+0xe727000>
 37e1d40: 9100c2d6     	add	x22, x22, #0x30
 37e1d44: 911002c8     	add	x8, x22, #0x400
 37e1d48: a9002016     	stp	x22, x8, [x0]
 37e1d4c: 9110a2c8     	add	x8, x22, #0x428
 37e1d50: f9000808     	str	x8, [x0, #0x10]
 37e1d54: 911182c8     	add	x8, x22, #0x460
 37e1d58: 911242c9     	add	x9, x22, #0x490
 37e1d5c: a906a408     	stp	x8, x9, [x0, #0x68]
 37e1d60: 911382c8     	add	x8, x22, #0x4e0
 37e1d64: f9005808     	str	x8, [x0, #0xb0]
 37e1d68: 911502c8     	add	x8, x22, #0x540
 37e1d6c: aa0003eb     	mov	x11, x0
 37e1d70: f80d8d68     	str	x8, [x11, #0xd8]!
 37e1d74: 9115c2c8     	add	x8, x22, #0x570
 37e1d78: f9007c08     	str	x8, [x0, #0xf8]
 37e1d7c: 911662c8     	add	x8, x22, #0x598
 37e1d80: d10283a9     	sub	x9, x29, #0xa0
 37e1d84: 9100292a     	add	x10, x9, #0xa
 37e1d88: f9019008     	str	x8, [x0, #0x320]
 37e1d8c: d0053d28     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e1d90: 913b6108     	add	x8, x8, #0xed8
 37e1d94: eb08015f     	cmp	x10, x8
 37e1d98: 528000aa     	mov	w10, #0x5               ; =5
 37e1d9c: 381773aa     	sturb	w10, [x29, #-0x89]
 37e1da0: fa488122     	ccmp	x9, x8, #0x2, hi
 37e1da4: 54fff389     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e1da8: aa0003f9     	mov	x25, x0
 37e1dac: f9000feb     	str	x11, [sp, #0x18]
 37e1db0: 52800e69     	mov	w9, #0x73               ; =115
 37e1db4: b81683a9     	stur	w9, [x29, #-0x98]
 37e1db8: f9400108     	ldr	x8, [x8]
 37e1dbc: f81603a8     	stur	x8, [x29, #-0xa0]
 37e1dc0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e1dc4: b0059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1dc8: f9404529     	ldr	x9, [x9, #0x88]
 37e1dcc: eb09011f     	cmp	x8, x9
 37e1dd0: 54000061     	b.ne	0x37e1ddc <_ChromeMain+0x37dcb40>
 37e1dd4: aa1903e0     	mov	x0, x25
 37e1dd8: 9720c949     	bl	0x142fc <_ChromeMain+0xf060>
 37e1ddc: 52800700     	mov	w0, #0x38               ; =56
 37e1de0: 9720b562     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1de4: aa0003e3     	mov	x3, x0
 37e1de8: 52800028     	mov	w8, #0x1                ; =1
 37e1dec: b9000008     	str	w8, [x0]
 37e1df0: 90003ac8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e1df4: 913a0108     	add	x8, x8, #0xe80
 37e1df8: 105bea49     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e1dfc: d503201f     	nop
 37e1e00: a900a408     	stp	x8, x9, [x0, #0x8]
 37e1e04: d0007428     	adrp	x8, 0x4667000 <_ChromeMain+0x4661d64>
 37e1e08: 9114c108     	add	x8, x8, #0x530
 37e1e0c: 90ff6be9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e1e10: 912c0129     	add	x9, x9, #0xb00
 37e1e14: a901a009     	stp	x9, x8, [x0, #0x18]
 37e1e18: a902e41f     	stp	xzr, x25, [x0, #0x28]
 37e1e1c: 52800048     	mov	w8, #0x2                ; =2
 37e1e20: b90003e8     	str	w8, [sp]
 37e1e24: d10283a1     	sub	x1, x29, #0xa0
 37e1e28: aa1903e0     	mov	x0, x25
 37e1e2c: 52800022     	mov	w2, #0x1                ; =1
 37e1e30: 52800084     	mov	w4, #0x4                ; =4
 37e1e34: 52800105     	mov	w5, #0x8                ; =8
 37e1e38: aa1703e6     	mov	x6, x23
 37e1e3c: d2800007     	mov	x7, #0x0                ; =0
 37e1e40: 943a0074     	bl	0x4662010 <_ChromeMain+0x465cd74>
 37e1e44: 38d773a8     	ldursb	w8, [x29, #-0x89]
 37e1e48: 36f800a8     	tbz	w8, #0x1f, 0x37e1e5c <_ChromeMain+0x37dcbc0>
 37e1e4c: f85603a0     	ldur	x0, [x29, #-0xa0]
 37e1e50: f85703a8     	ldur	x8, [x29, #-0x90]
 37e1e54: d37ff901     	lsl	x1, x8, #1
 37e1e58: 97209c18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e1e5c: 911002c8     	add	x8, x22, #0x400
 37e1e60: a9002336     	stp	x22, x8, [x25]
 37e1e64: 9110a2c8     	add	x8, x22, #0x428
 37e1e68: f9000b28     	str	x8, [x25, #0x10]
 37e1e6c: 911182c8     	add	x8, x22, #0x460
 37e1e70: 911242c9     	add	x9, x22, #0x490
 37e1e74: a906a728     	stp	x8, x9, [x25, #0x68]
 37e1e78: 911382c8     	add	x8, x22, #0x4e0
 37e1e7c: f9005b28     	str	x8, [x25, #0xb0]
 37e1e80: 911502c8     	add	x8, x22, #0x540
 37e1e84: f9006f28     	str	x8, [x25, #0xd8]
 37e1e88: 9115c2c8     	add	x8, x22, #0x570
 37e1e8c: f9007f28     	str	x8, [x25, #0xf8]
 37e1e90: 911662c8     	add	x8, x22, #0x598
 37e1e94: f9019328     	str	x8, [x25, #0x320]
 37e1e98: f9019735     	str	x21, [x25, #0x328]
 37e1e9c: f9019b3a     	str	x26, [x25, #0x330]
 37e1ea0: f9019f3b     	str	x27, [x25, #0x338]
 37e1ea4: f901a33c     	str	x28, [x25, #0x340]
 37e1ea8: f901a734     	str	x20, [x25, #0x348]
 37e1eac: f901ab38     	str	x24, [x25, #0x350]
 37e1eb0: 910d6337     	add	x23, x25, #0x358
 37e1eb4: f901d73f     	str	xzr, [x25, #0x3a8]
 37e1eb8: 6f00e400     	movi.2d	v0, #0000000000000000
 37e1ebc: ad0002e0     	stp	q0, q0, [x23]
 37e1ec0: ad0102e0     	stp	q0, q0, [x23, #0x20]
 37e1ec4: 3d8012e0     	str	q0, [x23, #0x40]
 37e1ec8: 910ec320     	add	x0, x25, #0x3b0
 37e1ecc: 910c8321     	add	x1, x25, #0x320
 37e1ed0: 52800782     	mov	w2, #0x3c               ; =60
 37e1ed4: 976e334b     	bl	0x136ec00 <_ChromeMain+0x1369964>
 37e1ed8: 90055808     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 37e1edc: 91240108     	add	x8, x8, #0x900
 37e1ee0: f901db28     	str	x8, [x25, #0x3b0]
 37e1ee4: 910c8334     	add	x20, x25, #0x320
 37e1ee8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e1eec: b0059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e1ef0: f9404529     	ldr	x9, [x9, #0x88]
 37e1ef4: eb09011f     	cmp	x8, x9
 37e1ef8: 54000061     	b.ne	0x37e1f04 <_ChromeMain+0x37dcc68>
 37e1efc: 910c8320     	add	x0, x25, #0x320
 37e1f00: 9720c8ff     	bl	0x142fc <_ChromeMain+0xf060>
 37e1f04: f901ff34     	str	x20, [x25, #0x3f8]
 37e1f08: 52800028     	mov	w8, #0x1                ; =1
 37e1f0c: b9040328     	str	w8, [x25, #0x400]
 37e1f10: 3910133f     	strb	wzr, [x25, #0x404]
 37e1f14: 3910233f     	strb	wzr, [x25, #0x408]
 37e1f18: f9020b3f     	str	xzr, [x25, #0x410]
 37e1f1c: f902133f     	str	xzr, [x25, #0x420]
 37e1f20: f9020f3f     	str	xzr, [x25, #0x418]
 37e1f24: 529a9808     	mov	w8, #0xd4c0             ; =54464
 37e1f28: 72a00028     	movk	w8, #0x1, lsl #16
 37e1f2c: f9021728     	str	x8, [x25, #0x428]
 37e1f30: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 37e1f34: f9021b28     	str	x8, [x25, #0x430]
 37e1f38: b9402fe8     	ldr	w8, [sp, #0x2c]
 37e1f3c: 3910e328     	strb	w8, [x25, #0x438]
 37e1f40: f9418b34     	ldr	x20, [x25, #0x310]
 37e1f44: 52800600     	mov	w0, #0x30               ; =48
 37e1f48: 9720b508     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e1f4c: f9003be0     	str	x0, [sp, #0x70]
 37e1f50: f0053ae8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 37e1f54: 3dc00900     	ldr	q0, [x8, #0x20]
 37e1f58: 3c8783e0     	stur	q0, [sp, #0x78]
 37e1f5c: 91008009     	add	x9, x0, #0x20
 37e1f60: eb00013f     	cmp	x9, x0
 37e1f64: 9101c3f8     	add	x24, sp, #0x70
 37e1f68: 54ffe563     	b.lo	0x37e1c14 <_ChromeMain+0x37dc978>
 37e1f6c: d0053d28     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e1f70: 913b9108     	add	x8, x8, #0xee4
 37e1f74: eb08013f     	cmp	x9, x8
 37e1f78: fa488002     	ccmp	x0, x8, #0x2, hi
 37e1f7c: 54ffe4c9     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e1f80: ad400500     	ldp	q0, q1, [x8]
 37e1f84: ad000400     	stp	q0, q1, [x0]
 37e1f88: 7900401f     	strh	wzr, [x0, #0x20]
 37e1f8c: 9101c3e1     	add	x1, sp, #0x70
 37e1f90: aa1403e0     	mov	x0, x20
 37e1f94: 9741926c     	bl	0x846944 <_ChromeMain+0x8416a8>
 37e1f98: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e1f9c: 36f800a8     	tbz	w8, #0x1f, 0x37e1fb0 <_ChromeMain+0x37dcd14>
 37e1fa0: f9403be0     	ldr	x0, [sp, #0x70]
 37e1fa4: f94043e8     	ldr	x8, [sp, #0x80]
 37e1fa8: d37ff901     	lsl	x1, x8, #1
 37e1fac: 97209bc3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e1fb0: f9418b28     	ldr	x8, [x25, #0x310]
 37e1fb4: f9427114     	ldr	x20, [x8, #0x4e0]
 37e1fb8: b4000174     	cbz	x20, 0x37e1fe4 <_ChromeMain+0x37dcd48>
 37e1fbc: 3950e328     	ldrb	w8, [x25, #0x438]
 37e1fc0: 39504289     	ldrb	w9, [x20, #0x410]
 37e1fc4: 6b08013f     	cmp	w9, w8
 37e1fc8: 540000e0     	b.eq	0x37e1fe4 <_ChromeMain+0x37dcd48>
 37e1fcc: 39104288     	strb	w8, [x20, #0x410]
 37e1fd0: 910e2280     	add	x0, x20, #0x388
 37e1fd4: 52000101     	eor	w1, w8, #0x1
 37e1fd8: 97aef263     	bl	0x239e964 <_ChromeMain+0x23996c8>
 37e1fdc: aa1403e0     	mov	x0, x20
 37e1fe0: 9736fc67     	bl	0x5a117c <_ChromeMain+0x59bee0>
 37e1fe4: f9418f28     	ldr	x8, [x25, #0x318]
 37e1fe8: 90053ac9     	adrp	x9, 0xdf39000 <dyld_stub_binder+0xdf39000>
 37e1fec: 3dc28d20     	ldr	q0, [x9, #0xa30]
 37e1ff0: 3d801fe0     	str	q0, [sp, #0x70]
 37e1ff4: 90059121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e1ff8: 91122021     	add	x1, x1, #0x488
 37e1ffc: 91036100     	add	x0, x8, #0xd8
 37e2000: 9101c3e2     	add	x2, sp, #0x70
 37e2004: 978c2f97     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e2008: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e200c: 91120108     	add	x8, x8, #0x480
 37e2010: f8bfc100     	ldapr	x0, [x8]
 37e2014: b401a500     	cbz	x0, 0x37e54b4 <_ChromeMain+0x37e0218>
 37e2018: 5280cf01     	mov	w1, #0x678              ; =1656
 37e201c: d2800002     	mov	x2, #0x0                ; =0
 37e2020: 97232564     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e2024: aa0003fa     	mov	x26, x0
 37e2028: 9429838d     	bl	0x4242e5c <_ChromeMain+0x423dbc0>
 37e202c: b0057a28     	adrp	x8, 0xe727000 <dyld_stub_binder+0xe727000>
 37e2030: 91184108     	add	x8, x8, #0x610
 37e2034: 91138109     	add	x9, x8, #0x4e0
 37e2038: a9002408     	stp	x8, x9, [x0]
 37e203c: 91142109     	add	x9, x8, #0x508
 37e2040: f9000809     	str	x9, [x0, #0x10]
 37e2044: 91150109     	add	x9, x8, #0x540
 37e2048: 9115c10a     	add	x10, x8, #0x570
 37e204c: a906a809     	stp	x9, x10, [x0, #0x68]
 37e2050: 91170109     	add	x9, x8, #0x5c0
 37e2054: f9005809     	str	x9, [x0, #0xb0]
 37e2058: 91188109     	add	x9, x8, #0x620
 37e205c: f9006c09     	str	x9, [x0, #0xd8]
 37e2060: 91194109     	add	x9, x8, #0x650
 37e2064: f9007c09     	str	x9, [x0, #0xf8]
 37e2068: 9119e109     	add	x9, x8, #0x678
 37e206c: f9018809     	str	x9, [x0, #0x310]
 37e2070: 911be109     	add	x9, x8, #0x6f8
 37e2074: f9018c09     	str	x9, [x0, #0x318]
 37e2078: 911ee109     	add	x9, x8, #0x7b8
 37e207c: f9019009     	str	x9, [x0, #0x320]
 37e2080: 911fc109     	add	x9, x8, #0x7f0
 37e2084: f9025809     	str	x9, [x0, #0x4b0]
 37e2088: 91210109     	add	x9, x8, #0x840
 37e208c: f9025c09     	str	x9, [x0, #0x4b8]
 37e2090: 9121c108     	add	x8, x8, #0x870
 37e2094: f9031408     	str	x8, [x0, #0x628]
 37e2098: f9426414     	ldr	x20, [x0, #0x4c8]
 37e209c: f941ae96     	ldr	x22, [x20, #0x358]
 37e20a0: f94026d5     	ldr	x21, [x22, #0x48]
 37e20a4: b94046a8     	ldr	w8, [x21, #0x44]
 37e20a8: 3100051f     	cmn	w8, #0x1
 37e20ac: 5401b900     	b.eq	0x37e57cc <_ChromeMain+0x37e0530>
 37e20b0: 528001c9     	mov	w9, #0xe                ; =14
 37e20b4: 4b080121     	sub	w1, w9, w8
 37e20b8: aa1503e0     	mov	x0, x21
 37e20bc: 52800002     	mov	w2, #0x0                ; =0
 37e20c0: 52803203     	mov	w3, #0x190              ; =400
 37e20c4: 9793156f     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 37e20c8: f9003be0     	str	x0, [sp, #0x70]
 37e20cc: b40000a0     	cbz	x0, 0x37e20e0 <_ChromeMain+0x37dce44>
 37e20d0: b9400008     	ldr	w8, [x0]
 37e20d4: 31000508     	adds	w8, w8, #0x1
 37e20d8: b9000008     	str	w8, [x0]
 37e20dc: 5401a922     	b.hs	0x37e5600 <_ChromeMain+0x37e0364>
 37e20e0: f9400288     	ldr	x8, [x20]
 37e20e4: f941ed08     	ldr	x8, [x8, #0x3d8]
 37e20e8: 9101c3e1     	add	x1, sp, #0x70
 37e20ec: aa1403e0     	mov	x0, x20
 37e20f0: d63f0100     	blr	x8
 37e20f4: f9403be0     	ldr	x0, [sp, #0x70]
 37e20f8: b40000c0     	cbz	x0, 0x37e2110 <_ChromeMain+0x37dce74>
 37e20fc: b9400009     	ldr	w9, [x0]
 37e2100: 51000528     	sub	w8, w9, #0x1
 37e2104: b9000008     	str	w8, [x0]
 37e2108: 3401a829     	cbz	w9, 0x37e560c <_ChromeMain+0x37e0370>
 37e210c: 34014928     	cbz	w8, 0x37e4a30 <_ChromeMain+0x37df794>
 37e2110: f90093ff     	str	xzr, [sp, #0x120]
 37e2114: 6f00e400     	movi.2d	v0, #0000000000000000
 37e2118: ad048300     	stp	q0, q0, [x24, #0x90]
 37e211c: 52801d88     	mov	w8, #0xec               ; =236
 37e2120: b81583a8     	stur	w8, [x29, #-0xa8]
 37e2124: 3815c3bf     	sturb	wzr, [x29, #-0xa4]
 37e2128: d0058f80     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 37e212c: 91398000     	add	x0, x0, #0xe60
 37e2130: 910403e8     	add	x8, sp, #0x100
 37e2134: d102a3a1     	sub	x1, x29, #0xa8
 37e2138: 52800202     	mov	w2, #0x10               ; =16
 37e213c: d2800003     	mov	x3, #0x0                ; =0
 37e2140: 975849f8     	bl	0xdf4920 <_ChromeMain+0xdef684>
 37e2144: 3901c3ff     	strb	wzr, [sp, #0x70]
 37e2148: 52801fe8     	mov	w8, #0xff               ; =255
 37e214c: 390243e8     	strb	w8, [sp, #0x90]
 37e2150: 9101c3f5     	add	x21, sp, #0x70
 37e2154: 9101c3e0     	add	x0, sp, #0x70
 37e2158: 910403e1     	add	x1, sp, #0x100
 37e215c: 973b730c     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 37e2160: 52800028     	mov	w8, #0x1                ; =1
 37e2164: 390263e8     	strb	w8, [sp, #0x98]
 37e2168: f9400348     	ldr	x8, [x26]
 37e216c: f9422d08     	ldr	x8, [x8, #0x458]
 37e2170: 9101c3e2     	add	x2, sp, #0x70
 37e2174: aa1a03e0     	mov	x0, x26
 37e2178: 52800001     	mov	w1, #0x0                ; =0
 37e217c: d63f0100     	blr	x8
 37e2180: 394263e8     	ldrb	w8, [sp, #0x98]
 37e2184: 34000068     	cbz	w8, 0x37e2190 <_ChromeMain+0x37dcef4>
 37e2188: 9101c3e0     	add	x0, sp, #0x70
 37e218c: 974191ad     	bl	0x846840 <_ChromeMain+0x8415a4>
 37e2190: f9400348     	ldr	x8, [x26]
 37e2194: f9423108     	ldr	x8, [x8, #0x460]
 37e2198: b0053d34     	adrp	x20, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e219c: 913c1a94     	add	x20, x20, #0xf06
 37e21a0: 52800116     	mov	w22, #0x8               ; =8
 37e21a4: aa1a03e0     	mov	x0, x26
 37e21a8: aa1403e1     	mov	x1, x20
 37e21ac: 52800102     	mov	w2, #0x8                ; =8
 37e21b0: d63f0100     	blr	x8
 37e21b4: 39021ff6     	strb	w22, [sp, #0x87]
 37e21b8: 910042a8     	add	x8, x21, #0x10
 37e21bc: eb14011f     	cmp	x8, x20
 37e21c0: fa5482a2     	ccmp	x21, x20, #0x2, hi
 37e21c4: 54ffd289     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e21c8: 3dc00280     	ldr	q0, [x20]
 37e21cc: 3d801fe0     	str	q0, [sp, #0x70]
 37e21d0: 790103ff     	strh	wzr, [sp, #0x80]
 37e21d4: 9101c3e1     	add	x1, sp, #0x70
 37e21d8: aa1a03e0     	mov	x0, x26
 37e21dc: 974191da     	bl	0x846944 <_ChromeMain+0x8416a8>
 37e21e0: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e21e4: 36f800a8     	tbz	w8, #0x1f, 0x37e21f8 <_ChromeMain+0x37dcf5c>
 37e21e8: f9403be0     	ldr	x0, [sp, #0x70]
 37e21ec: f94043e8     	ldr	x8, [sp, #0x80]
 37e21f0: d37ff901     	lsl	x1, x8, #1
 37e21f4: 97209b31     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e21f8: 6f00e400     	movi.2d	v0, #0000000000000000
 37e21fc: ad068300     	stp	q0, q0, [x24, #0xd0]
 37e2200: 12800008     	mov	w8, #-0x1               ; =-1
 37e2204: b814c3a8     	stur	w8, [x29, #-0xb4]
 37e2208: d10343a1     	sub	x1, x29, #0xd0
 37e220c: 5290a260     	mov	w0, #0x8513             ; =34067
 37e2210: 97c69293     	bl	0x2986c5c <_ChromeMain+0x29819c0>
 37e2214: f9401bf6     	ldr	x22, [sp, #0x30]
 37e2218: 340001e0     	cbz	w0, 0x37e2254 <_ChromeMain+0x37dcfb8>
 37e221c: 9101c3f4     	add	x20, sp, #0x70
 37e2220: 9101c3e8     	add	x8, sp, #0x70
 37e2224: d10343a0     	sub	x0, x29, #0xd0
 37e2228: 97eefcb7     	bl	0x33a1504 <_ChromeMain+0x339c268>
 37e222c: 39821fe8     	ldrsb	x8, [sp, #0x87]
 37e2230: a9472be9     	ldp	x9, x10, [sp, #0x70]
 37e2234: f100011f     	cmp	x8, #0x0
 37e2238: 9a944121     	csel	x1, x9, x20, mi
 37e223c: 7100011f     	cmp	w8, #0x0
 37e2240: 9a884142     	csel	x2, x10, x8, mi
 37e2244: aa1a03e0     	mov	x0, x26
 37e2248: 94298982     	bl	0x4244850 <_ChromeMain+0x423f5b4>
 37e224c: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e2250: 37f94bc8     	tbnz	w8, #0x1f, 0x37e4bc8 <_ChromeMain+0x37df92c>
 37e2254: b5014c56     	cbnz	x22, 0x37e4bdc <_ChromeMain+0x37df940>
 37e2258: f81203b6     	stur	x22, [x29, #-0xe0]
 37e225c: 52800028     	mov	w8, #0x1                ; =1
 37e2260: 381283a8     	sturb	w8, [x29, #-0xd8]
 37e2264: f9400348     	ldr	x8, [x26]
 37e2268: f941ed08     	ldr	x8, [x8, #0x3d8]
 37e226c: d10383a1     	sub	x1, x29, #0xe0
 37e2270: aa1a03e0     	mov	x0, x26
 37e2274: d63f0100     	blr	x8
 37e2278: 385283a8     	ldurb	w8, [x29, #-0xd8]
 37e227c: 7103fd1f     	cmp	w8, #0xff
 37e2280: 54000060     	b.eq	0x37e228c <_ChromeMain+0x37dcff0>
 37e2284: f85203a0     	ldur	x0, [x29, #-0xe0]
 37e2288: b5014ce0     	cbnz	x0, 0x37e4c24 <_ChromeMain+0x37df988>
 37e228c: 52801fe8     	mov	w8, #0xff               ; =255
 37e2290: 381283a8     	sturb	w8, [x29, #-0xd8]
 37e2294: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e2298: 91120108     	add	x8, x8, #0x480
 37e229c: f8bfc100     	ldapr	x0, [x8]
 37e22a0: b40190e0     	cbz	x0, 0x37e54bc <_ChromeMain+0x37e0220>
 37e22a4: 52809b01     	mov	w1, #0x4d8              ; =1240
 37e22a8: d2800002     	mov	x2, #0x0                ; =0
 37e22ac: 972324c1     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e22b0: aa0003fb     	mov	x27, x0
 37e22b4: b5014776     	cbnz	x22, 0x37e4ba0 <_ChromeMain+0x37df904>
 37e22b8: d0057a35     	adrp	x21, 0xe728000 <dyld_stub_binder+0xe728000>
 37e22bc: 911142b5     	add	x21, x21, #0x450
 37e22c0: 911182a8     	add	x8, x21, #0x460
 37e22c4: a9002375     	stp	x21, x8, [x27]
 37e22c8: 911222a8     	add	x8, x21, #0x488
 37e22cc: f9000b68     	str	x8, [x27, #0x10]
 37e22d0: 911302a8     	add	x8, x21, #0x4c0
 37e22d4: 9113c2a9     	add	x9, x21, #0x4f0
 37e22d8: a906a768     	stp	x8, x9, [x27, #0x68]
 37e22dc: 911502a8     	add	x8, x21, #0x540
 37e22e0: f9005b68     	str	x8, [x27, #0xb0]
 37e22e4: 911682a8     	add	x8, x21, #0x5a0
 37e22e8: aa1b03fc     	mov	x28, x27
 37e22ec: f80d8f88     	str	x8, [x28, #0xd8]!
 37e22f0: 911742a8     	add	x8, x21, #0x5d0
 37e22f4: aa1b03f4     	mov	x20, x27
 37e22f8: f80f8e88     	str	x8, [x20, #0xf8]!
 37e22fc: 9117e2a8     	add	x8, x21, #0x5f8
 37e2300: f9018b68     	str	x8, [x27, #0x310]
 37e2304: 9119e2a8     	add	x8, x21, #0x678
 37e2308: f9018f68     	str	x8, [x27, #0x318]
 37e230c: 911ce2a8     	add	x8, x21, #0x738
 37e2310: f9019368     	str	x8, [x27, #0x320]
 37e2314: 925e7768     	and	x8, x27, #0xfffffffc00000000
 37e2318: 90059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e231c: f9404529     	ldr	x9, [x9, #0x88]
 37e2320: eb09011f     	cmp	x8, x9
 37e2324: 54000061     	b.ne	0x37e2330 <_ChromeMain+0x37dd094>
 37e2328: aa1b03e0     	mov	x0, x27
 37e232c: 9720c7f4     	bl	0x142fc <_ChromeMain+0xf060>
 37e2330: 52800700     	mov	w0, #0x38               ; =56
 37e2334: 9720b40d     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e2338: 52800028     	mov	w8, #0x1                ; =1
 37e233c: b0003e89     	adrp	x9, 0x3fb3000 <_ChromeMain+0x3fadd64>
 37e2340: 91300129     	add	x9, x9, #0xc00
 37e2344: 105bbfea     	adr	x10, 0x3899b40 <_ChromeMain+0x38948a4>
 37e2348: d503201f     	nop
 37e234c: b9000008     	str	w8, [x0]
 37e2350: a900a809     	stp	x9, x10, [x0, #0x8]
 37e2354: f0007428     	adrp	x8, 0x4669000 <_ChromeMain+0x4663d64>
 37e2358: 9116c108     	add	x8, x8, #0x5b0
 37e235c: f0ff6bc9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e2360: 912c0129     	add	x9, x9, #0xb00
 37e2364: a901a009     	stp	x9, x8, [x0, #0x18]
 37e2368: a902ec1f     	stp	xzr, x27, [x0, #0x28]
 37e236c: f81803a0     	stur	x0, [x29, #-0x80]
 37e2370: 52800048     	mov	w8, #0x2                ; =2
 37e2374: 381883a8     	sturb	w8, [x29, #-0x78]
 37e2378: d10203a1     	sub	x1, x29, #0x80
 37e237c: aa1b03e0     	mov	x0, x27
 37e2380: 976e3040     	bl	0x136e480 <_ChromeMain+0x13691e4>
 37e2384: 385883a8     	ldurb	w8, [x29, #-0x78]
 37e2388: 7103fd1f     	cmp	w8, #0xff
 37e238c: 54000060     	b.eq	0x37e2398 <_ChromeMain+0x37dd0fc>
 37e2390: f85803a0     	ldur	x0, [x29, #-0x80]
 37e2394: b5014560     	cbnz	x0, 0x37e4c40 <_ChromeMain+0x37df9a4>
 37e2398: 52801fe8     	mov	w8, #0xff               ; =255
 37e239c: 381883a8     	sturb	w8, [x29, #-0x78]
 37e23a0: 911182a8     	add	x8, x21, #0x460
 37e23a4: a9002375     	stp	x21, x8, [x27]
 37e23a8: 911222a8     	add	x8, x21, #0x488
 37e23ac: f9000b68     	str	x8, [x27, #0x10]
 37e23b0: 911302a8     	add	x8, x21, #0x4c0
 37e23b4: 9113c2a9     	add	x9, x21, #0x4f0
 37e23b8: a906a768     	stp	x8, x9, [x27, #0x68]
 37e23bc: 911502a8     	add	x8, x21, #0x540
 37e23c0: f9005b68     	str	x8, [x27, #0xb0]
 37e23c4: 911682a8     	add	x8, x21, #0x5a0
 37e23c8: f9006f68     	str	x8, [x27, #0xd8]
 37e23cc: 911742a8     	add	x8, x21, #0x5d0
 37e23d0: f9007f68     	str	x8, [x27, #0xf8]
 37e23d4: 9117e2a8     	add	x8, x21, #0x5f8
 37e23d8: f9018b68     	str	x8, [x27, #0x310]
 37e23dc: 9119e2a8     	add	x8, x21, #0x678
 37e23e0: f9018f68     	str	x8, [x27, #0x318]
 37e23e4: 911ce2a8     	add	x8, x21, #0x738
 37e23e8: f9019368     	str	x8, [x27, #0x320]
 37e23ec: 3912c37f     	strb	wzr, [x27, #0x4b0]
 37e23f0: 3912d37f     	strb	wzr, [x27, #0x4b4]
 37e23f4: 3912e37f     	strb	wzr, [x27, #0x4b8]
 37e23f8: f9026376     	str	x22, [x27, #0x4c0]
 37e23fc: 91132376     	add	x22, x27, #0x4c8
 37e2400: 6f00e400     	movi.2d	v0, #0000000000000000
 37e2404: 3d8002c0     	str	q0, [x22]
 37e2408: 39518368     	ldrb	w8, [x27, #0x460]
 37e240c: 340000a8     	cbz	w8, 0x37e2420 <_ChromeMain+0x37dd184>
 37e2410: 3911837f     	strb	wzr, [x27, #0x460]
 37e2414: 91118361     	add	x1, x27, #0x460
 37e2418: aa1403e0     	mov	x0, x20
 37e241c: 975d16ed     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e2420: f9424368     	ldr	x8, [x27, #0x480]
 37e2424: 52800035     	mov	w21, #0x1               ; =1
 37e2428: b9001915     	str	w21, [x8, #0x18]
 37e242c: b9446768     	ldr	w8, [x27, #0x464]
 37e2430: 7120011f     	cmp	w8, #0x800
 37e2434: 540000e0     	b.eq	0x37e2450 <_ChromeMain+0x37dd1b4>
 37e2438: 91119368     	add	x8, x27, #0x464
 37e243c: 52810009     	mov	w9, #0x800              ; =2048
 37e2440: b9000109     	str	w9, [x8]
 37e2444: 91119361     	add	x1, x27, #0x464
 37e2448: aa1403e0     	mov	x0, x20
 37e244c: 975d16e1     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e2450: 39072f75     	strb	w21, [x27, #0x1cb]
 37e2454: aa1b03e0     	mov	x0, x27
 37e2458: 52800021     	mov	w1, #0x1                ; =1
 37e245c: 977554e0     	bl	0x15377dc <_ChromeMain+0x1532540>
 37e2460: f9400368     	ldr	x8, [x27]
 37e2464: f9405108     	ldr	x8, [x8, #0xa0]
 37e2468: aa1b03e0     	mov	x0, x27
 37e246c: 52800001     	mov	w1, #0x0                ; =0
 37e2470: d63f0100     	blr	x8
 37e2474: 52802800     	mov	w0, #0x140              ; =320
 37e2478: 9720b3bc     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e247c: aa0003f4     	mov	x20, x0
 37e2480: 97c8b854     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e2484: aa1b03e0     	mov	x0, x27
 37e2488: aa1403e1     	mov	x1, x20
 37e248c: 978e9ceb     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e2490: b940f288     	ldr	w8, [x20, #0xf0]
 37e2494: 35012de8     	cbnz	w8, 0x37e4a50 <_ChromeMain+0x37df7b4>
 37e2498: b90073f5     	str	w21, [sp, #0x70]
 37e249c: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e24a0: 9115a021     	add	x1, x1, #0x568
 37e24a4: 91046280     	add	x0, x20, #0x118
 37e24a8: 9101c3e2     	add	x2, sp, #0x70
 37e24ac: 978a0b3e     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 37e24b0: 3943d288     	ldrb	w8, [x20, #0xf4]
 37e24b4: 370000a8     	tbnz	w8, #0x0, 0x37e24c8 <_ChromeMain+0x37dd22c>
 37e24b8: 3903d295     	strb	w21, [x20, #0xf4]
 37e24bc: aa1403e0     	mov	x0, x20
 37e24c0: 52800021     	mov	w1, #0x1                ; =1
 37e24c4: 978a0b7b     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 37e24c8: b940fa88     	ldr	w8, [x20, #0xf8]
 37e24cc: 7100191f     	cmp	w8, #0x6
 37e24d0: 54015781     	b.ne	0x37e4fc0 <_ChromeMain+0x37dfd24>
 37e24d4: b940fe88     	ldr	w8, [x20, #0xfc]
 37e24d8: 7100211f     	cmp	w8, #0x8
 37e24dc: 54015721     	b.ne	0x37e4fc0 <_ChromeMain+0x37dfd24>
 37e24e0: b9410288     	ldr	w8, [x20, #0x100]
 37e24e4: 7100191f     	cmp	w8, #0x6
 37e24e8: 540156c1     	b.ne	0x37e4fc0 <_ChromeMain+0x37dfd24>
 37e24ec: b9410688     	ldr	w8, [x20, #0x104]
 37e24f0: 7100211f     	cmp	w8, #0x8
 37e24f4: 54015661     	b.ne	0x37e4fc0 <_ChromeMain+0x37dfd24>
 37e24f8: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e24fc: 91120108     	add	x8, x8, #0x480
 37e2500: f8bfc100     	ldapr	x0, [x8]
 37e2504: b4017e00     	cbz	x0, 0x37e54c4 <_ChromeMain+0x37e0228>
 37e2508: 52807001     	mov	w1, #0x380              ; =896
 37e250c: d2800002     	mov	x2, #0x0                ; =0
 37e2510: 97232428     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e2514: aa0003f4     	mov	x20, x0
 37e2518: 97b12b48     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 37e251c: 90057688     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 37e2520: 912f4108     	add	x8, x8, #0xbd0
 37e2524: 910fc109     	add	x9, x8, #0x3f0
 37e2528: a9002408     	stp	x8, x9, [x0]
 37e252c: 91106109     	add	x9, x8, #0x418
 37e2530: f9000809     	str	x9, [x0, #0x10]
 37e2534: 91114109     	add	x9, x8, #0x450
 37e2538: 9112010a     	add	x10, x8, #0x480
 37e253c: a906a809     	stp	x9, x10, [x0, #0x68]
 37e2540: 91134109     	add	x9, x8, #0x4d0
 37e2544: f9005809     	str	x9, [x0, #0xb0]
 37e2548: 91158109     	add	x9, x8, #0x560
 37e254c: aa0003f5     	mov	x21, x0
 37e2550: f80f8ea9     	str	x9, [x21, #0xf8]!
 37e2554: 9114c108     	add	x8, x8, #0x530
 37e2558: f9006c08     	str	x8, [x0, #0xd8]
 37e255c: f901a41f     	str	xzr, [x0, #0x348]
 37e2560: 2f06e400     	movi	d0, #0xffff000000000000
 37e2564: fd01a800     	str	d0, [x0, #0x350]
 37e2568: 52800028     	mov	w8, #0x1                ; =1
 37e256c: 390d6008     	strb	w8, [x0, #0x358]
 37e2570: f901b01f     	str	xzr, [x0, #0x360]
 37e2574: 390da01f     	strb	wzr, [x0, #0x368]
 37e2578: f901b81f     	str	xzr, [x0, #0x370]
 37e257c: b903781f     	str	wzr, [x0, #0x378]
 37e2580: 390df01f     	strb	wzr, [x0, #0x37c]
 37e2584: 3945a408     	ldrb	w8, [x0, #0x169]
 37e2588: 35018488     	cbnz	w8, 0x37e5618 <_ChromeMain+0x37e037c>
 37e258c: f940cf62     	ldr	x2, [x27, #0x198]
 37e2590: aa1b03e0     	mov	x0, x27
 37e2594: aa1403e1     	mov	x1, x20
 37e2598: 973e5b99     	bl	0x7793fc <_ChromeMain+0x774160>
 37e259c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e25a0: 90059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e25a4: f9404529     	ldr	x9, [x9, #0x88]
 37e25a8: eb09011f     	cmp	x8, x9
 37e25ac: 54000061     	b.ne	0x37e25b8 <_ChromeMain+0x37dd31c>
 37e25b0: aa1403e0     	mov	x0, x20
 37e25b4: 9720c752     	bl	0x142fc <_ChromeMain+0xf060>
 37e25b8: f94002c0     	ldr	x0, [x22]
 37e25bc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e25c0: 90059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e25c4: f9404529     	ldr	x9, [x9, #0x88]
 37e25c8: eb09011f     	cmp	x8, x9
 37e25cc: 54000041     	b.ne	0x37e25d4 <_ChromeMain+0x37dd338>
 37e25d0: 9721011b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e25d4: f90002d4     	str	x20, [x22]
 37e25d8: 3946a688     	ldrb	w8, [x20, #0x1a9]
 37e25dc: 340000c8     	cbz	w8, 0x37e25f4 <_ChromeMain+0x37dd358>
 37e25e0: 3906a69f     	strb	wzr, [x20, #0x1a9]
 37e25e4: 9106a681     	add	x1, x20, #0x1a9
 37e25e8: aa1503e0     	mov	x0, x21
 37e25ec: 975d1679     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e25f0: f94002d4     	ldr	x20, [x22]
 37e25f4: 910c4288     	add	x8, x20, #0x310
 37e25f8: 394c6289     	ldrb	w9, [x20, #0x318]
 37e25fc: 35018149     	cbnz	w9, 0x37e5624 <_ChromeMain+0x37e0388>
 37e2600: b4ffb0a8     	cbz	x8, 0x37e1c14 <_ChromeMain+0x37dc978>
 37e2604: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 37e2608: f9018a88     	str	x8, [x20, #0x310]
 37e260c: 52800028     	mov	w8, #0x1                ; =1
 37e2610: 390c6288     	strb	w8, [x20, #0x318]
 37e2614: f940c680     	ldr	x0, [x20, #0x188]
 37e2618: b40000a0     	cbz	x0, 0x37e262c <_ChromeMain+0x37dd390>
 37e261c: f9400008     	ldr	x8, [x0]
 37e2620: f9417d08     	ldr	x8, [x8, #0x2f8]
 37e2624: aa1403e1     	mov	x1, x20
 37e2628: d63f0100     	blr	x8
 37e262c: aa1403e0     	mov	x0, x20
 37e2630: 52800001     	mov	w1, #0x0                ; =0
 37e2634: 97393790     	bl	0x630474 <_ChromeMain+0x62b1d8>
 37e2638: f9003bf4     	str	x20, [sp, #0x70]
 37e263c: 9104c280     	add	x0, x20, #0x130
 37e2640: 9101c3e3     	add	x3, sp, #0x70
 37e2644: 52800301     	mov	w1, #0x18               ; =24
 37e2648: 52800022     	mov	w2, #0x1                ; =1
 37e264c: 974312e1     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 37e2650: aa1403e0     	mov	x0, x20
 37e2654: 9769d125     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 37e2658: f94002c0     	ldr	x0, [x22]
 37e265c: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 37e2660: 52800022     	mov	w2, #0x1                ; =1
 37e2664: 97bfbcff     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 37e2668: f94002c8     	ldr	x8, [x22]
 37e266c: d0053ae9     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 37e2670: 3dc02520     	ldr	q0, [x9, #0x90]
 37e2674: 3d801fe0     	str	q0, [sp, #0x70]
 37e2678: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e267c: 91122021     	add	x1, x1, #0x488
 37e2680: 91036100     	add	x0, x8, #0xd8
 37e2684: 9101c3e2     	add	x2, sp, #0x70
 37e2688: 978c2df6     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e268c: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e2690: 91120108     	add	x8, x8, #0x480
 37e2694: f8bfc100     	ldapr	x0, [x8]
 37e2698: b40171a0     	cbz	x0, 0x37e54cc <_ChromeMain+0x37e0230>
 37e269c: 52808c01     	mov	w1, #0x460              ; =1120
 37e26a0: d2800002     	mov	x2, #0x0                ; =0
 37e26a4: 972323c3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e26a8: aa0003f4     	mov	x20, x0
 37e26ac: b0053d35     	adrp	x21, 0xdf87000 <dyld_stub_binder+0xdf87000>
 37e26b0: 913c1ab5     	add	x21, x21, #0xf06
 37e26b4: aa1503e1     	mov	x1, x21
 37e26b8: 52800102     	mov	w2, #0x8                ; =8
 37e26bc: 528000a3     	mov	w3, #0x5                ; =5
 37e26c0: 52820004     	mov	w4, #0x1000             ; =4096
 37e26c4: 52800005     	mov	w5, #0x0                ; =0
 37e26c8: 978ea086     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 37e26cc: 3945a408     	ldrb	w8, [x0, #0x169]
 37e26d0: 35017b08     	cbnz	w8, 0x37e5630 <_ChromeMain+0x37e0394>
 37e26d4: f940cf62     	ldr	x2, [x27, #0x198]
 37e26d8: aa1b03e0     	mov	x0, x27
 37e26dc: aa1403e1     	mov	x1, x20
 37e26e0: 973e5b47     	bl	0x7793fc <_ChromeMain+0x774160>
 37e26e4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e26e8: 90059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e26ec: f9404529     	ldr	x9, [x9, #0x88]
 37e26f0: eb09011f     	cmp	x8, x9
 37e26f4: 54000061     	b.ne	0x37e2700 <_ChromeMain+0x37dd464>
 37e26f8: aa1403e0     	mov	x0, x20
 37e26fc: 9720c700     	bl	0x142fc <_ChromeMain+0xf060>
 37e2700: f9426b60     	ldr	x0, [x27, #0x4d0]
 37e2704: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2708: 90059e89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e270c: f9404529     	ldr	x9, [x9, #0x88]
 37e2710: eb09011f     	cmp	x8, x9
 37e2714: 54000041     	b.ne	0x37e271c <_ChromeMain+0x37dd480>
 37e2718: 972100c9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e271c: f9026b74     	str	x20, [x27, #0x4d0]
 37e2720: 3946a688     	ldrb	w8, [x20, #0x1a9]
 37e2724: 340000c8     	cbz	w8, 0x37e273c <_ChromeMain+0x37dd4a0>
 37e2728: 3906a69f     	strb	wzr, [x20, #0x1a9]
 37e272c: 9103e280     	add	x0, x20, #0xf8
 37e2730: 9106a681     	add	x1, x20, #0x1a9
 37e2734: 975d1627     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e2738: f9426b74     	ldr	x20, [x27, #0x4d0]
 37e273c: aa1403e0     	mov	x0, x20
 37e2740: 52800061     	mov	w1, #0x3                ; =3
 37e2744: 978e9d6f     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 37e2748: f9426b60     	ldr	x0, [x27, #0x4d0]
 37e274c: 528000c1     	mov	w1, #0x6                ; =6
 37e2750: 9736f97c     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 37e2754: f9426b74     	ldr	x20, [x27, #0x4d0]
 37e2758: 394f6288     	ldrb	w8, [x20, #0x3d8]
 37e275c: 34000108     	cbz	w8, 0x37e277c <_ChromeMain+0x37dd4e0>
 37e2760: 390f629f     	strb	wzr, [x20, #0x3d8]
 37e2764: aa1403e0     	mov	x0, x20
 37e2768: 97370435     	bl	0x5a383c <_ChromeMain+0x59e5a0>
 37e276c: 9103e280     	add	x0, x20, #0xf8
 37e2770: 910f6281     	add	x1, x20, #0x3d8
 37e2774: 975d1617     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e2778: f9426b74     	ldr	x20, [x27, #0x4d0]
 37e277c: 394eda88     	ldrb	w8, [x20, #0x3b6]
 37e2780: 350127c8     	cbnz	w8, 0x37e4c78 <_ChromeMain+0x37df9dc>
 37e2784: aa1403e0     	mov	x0, x20
 37e2788: 52800001     	mov	w1, #0x0                ; =0
 37e278c: 97bd72f9     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 37e2790: f9426b60     	ldr	x0, [x27, #0x4d0]
 37e2794: b81783bf     	stur	wzr, [x29, #-0x88]
 37e2798: 52800028     	mov	w8, #0x1                ; =1
 37e279c: 3817c3a8     	sturb	w8, [x29, #-0x84]
 37e27a0: d10223a1     	sub	x1, x29, #0x88
 37e27a4: 974197d3     	bl	0x8486f0 <_ChromeMain+0x843454>
 37e27a8: f9426b74     	ldr	x20, [x27, #0x4d0]
 37e27ac: f941ae98     	ldr	x24, [x20, #0x358]
 37e27b0: f9402716     	ldr	x22, [x24, #0x48]
 37e27b4: b94046c8     	ldr	w8, [x22, #0x44]
 37e27b8: 3100051f     	cmn	w8, #0x1
 37e27bc: 54018120     	b.eq	0x37e57e0 <_ChromeMain+0x37e0544>
 37e27c0: 528001c9     	mov	w9, #0xe                ; =14
 37e27c4: 4b080121     	sub	w1, w9, w8
 37e27c8: aa1603e0     	mov	x0, x22
 37e27cc: 52800002     	mov	w2, #0x0                ; =0
 37e27d0: 52803203     	mov	w3, #0x190              ; =400
 37e27d4: 979313ab     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 37e27d8: f9003be0     	str	x0, [sp, #0x70]
 37e27dc: b40000a0     	cbz	x0, 0x37e27f0 <_ChromeMain+0x37dd554>
 37e27e0: b9400008     	ldr	w8, [x0]
 37e27e4: 31000508     	adds	w8, w8, #0x1
 37e27e8: b9000008     	str	w8, [x0]
 37e27ec: 54017282     	b.hs	0x37e563c <_ChromeMain+0x37e03a0>
 37e27f0: f9400288     	ldr	x8, [x20]
 37e27f4: f941ed08     	ldr	x8, [x8, #0x3d8]
 37e27f8: 9101c3e1     	add	x1, sp, #0x70
 37e27fc: aa1403e0     	mov	x0, x20
 37e2800: d63f0100     	blr	x8
 37e2804: f9403be0     	ldr	x0, [sp, #0x70]
 37e2808: b40000c0     	cbz	x0, 0x37e2820 <_ChromeMain+0x37dd584>
 37e280c: b9400009     	ldr	w9, [x0]
 37e2810: 51000528     	sub	w8, w9, #0x1
 37e2814: b9000008     	str	w8, [x0]
 37e2818: 34017189     	cbz	w9, 0x37e5648 <_ChromeMain+0x37e03ac>
 37e281c: 34011128     	cbz	w8, 0x37e4a40 <_ChromeMain+0x37df7a4>
 37e2820: f9426b74     	ldr	x20, [x27, #0x4d0]
 37e2824: 52800800     	mov	w0, #0x40               ; =64
 37e2828: 9720b2d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e282c: 52800028     	mov	w8, #0x1                ; =1
 37e2830: b9000008     	str	w8, [x0]
 37e2834: b0fec228     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 37e2838: 91260109     	add	x9, x8, #0x980
 37e283c: 90fe5888     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e2840: 91220108     	add	x8, x8, #0x880
 37e2844: a900a009     	stp	x9, x8, [x0, #0x8]
 37e2848: f0ff6bc8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 37e284c: 912c0109     	add	x9, x8, #0xb00
 37e2850: 90001a28     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e2854: 91310108     	add	x8, x8, #0xc40
 37e2858: a901a009     	stp	x9, x8, [x0, #0x18]
 37e285c: b0053ae8     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 37e2860: 3dc3d900     	ldr	q0, [x8, #0xf60]
 37e2864: 3c828000     	stur	q0, [x0, #0x28]
 37e2868: 3900e01f     	strb	wzr, [x0, #0x38]
 37e286c: f9003be0     	str	x0, [sp, #0x70]
 37e2870: 0f000420     	movi.2s	v0, #0x1
 37e2874: fd003fe0     	str	d0, [sp, #0x78]
 37e2878: 52800068     	mov	w8, #0x3                ; =3
 37e287c: b90083e8     	str	w8, [sp, #0x80]
 37e2880: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 37e2884: f90047ff     	str	xzr, [sp, #0x88]
 37e2888: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e288c: 91152021     	add	x1, x1, #0x548
 37e2890: 91036280     	add	x0, x20, #0xd8
 37e2894: 9101c3e2     	add	x2, sp, #0x70
 37e2898: 9790c6bd     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e289c: 9101c3e0     	add	x0, sp, #0x70
 37e28a0: 977da121     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e28a4: 52800600     	mov	w0, #0x30               ; =48
 37e28a8: 9720b2b0     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e28ac: aa0003e4     	mov	x4, x0
 37e28b0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 37e28b4: 7900301f     	strh	wzr, [x0, #0x18]
 37e28b8: 90055b76     	adrp	x22, 0xe34e000 <dyld_stub_binder+0xe34e000>
 37e28bc: 913622d6     	add	x22, x22, #0xd88
 37e28c0: f9000016     	str	x22, [x0]
 37e28c4: 4f01f480     	fmov.4s	v0, #10.00000000
 37e28c8: 3c81c000     	stur	q0, [x0, #0x1c]
 37e28cc: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e28d0: 9114a021     	add	x1, x1, #0x528
 37e28d4: f0052b02     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 37e28d8: 91264842     	add	x2, x2, #0x992
 37e28dc: d0ffb443     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 37e28e0: 913c0063     	add	x3, x3, #0xf00
 37e28e4: aa1c03e0     	mov	x0, x28
 37e28e8: d2800005     	mov	x5, #0x0                ; =0
 37e28ec: 974e1e2c     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 37e28f0: b50123a0     	cbnz	x0, 0x37e4d64 <_ChromeMain+0x37dfac8>
 37e28f4: aa1b03e0     	mov	x0, x27
 37e28f8: 976e3152     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 37e28fc: aa1b03e9     	mov	x9, x27
 37e2900: f84e8d28     	ldr	x8, [x9, #0xe8]!
 37e2904: 90059e9c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e2908: b4000128     	cbz	x8, 0x37e292c <_ChromeMain+0x37dd690>
 37e290c: d005910a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 37e2910: 9132c14a     	add	x10, x10, #0xcb0
 37e2914: f940110b     	ldr	x11, [x8, #0x20]
 37e2918: eb0a017f     	cmp	x11, x10
 37e291c: 540107c8     	b.hi	0x37e4a14 <_ChromeMain+0x37df778>
 37e2920: 54ff9722     	b.hs	0x37e1c04 <_ChromeMain+0x37dc968>
 37e2924: f9400508     	ldr	x8, [x8, #0x8]
 37e2928: b5ffff68     	cbnz	x8, 0x37e2914 <_ChromeMain+0x37dd678>
 37e292c: d2800014     	mov	x20, #0x0               ; =0
 37e2930: 52800600     	mov	w0, #0x30               ; =48
 37e2934: 9720b28d     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e2938: aa0003e8     	mov	x8, x0
 37e293c: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 37e2940: 7900301f     	strh	wzr, [x0, #0x18]
 37e2944: f9000016     	str	x22, [x0]
 37e2948: 4f01f480     	fmov.4s	v0, #10.00000000
 37e294c: 3c81c000     	stur	q0, [x0, #0x1c]
 37e2950: f9418e80     	ldr	x0, [x20, #0x318]
 37e2954: f9018e88     	str	x8, [x20, #0x318]
 37e2958: b50172c0     	cbnz	x0, 0x37e57b0 <_ChromeMain+0x37e0514>
 37e295c: aa1403e0     	mov	x0, x20
 37e2960: 52800001     	mov	w1, #0x0                ; =0
 37e2964: 973936c4     	bl	0x630474 <_ChromeMain+0x62b1d8>
 37e2968: aa1403e0     	mov	x0, x20
 37e296c: 9736fa04     	bl	0x5a117c <_ChromeMain+0x59bee0>
 37e2970: f9416760     	ldr	x0, [x27, #0x2c8]
 37e2974: b4013360     	cbz	x0, 0x37e4fe0 <_ChromeMain+0x37dfd44>
 37e2978: 52801481     	mov	w1, #0xa4               ; =164
 37e297c: 977aaed9     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 37e2980: f9416760     	ldr	x0, [x27, #0x2c8]
 37e2984: b4013480     	cbz	x0, 0x37e5014 <_ChromeMain+0x37dfd78>
 37e2988: 52800108     	mov	w8, #0x8                ; =8
 37e298c: 39021fe8     	strb	w8, [sp, #0x87]
 37e2990: 9101c3e8     	add	x8, sp, #0x70
 37e2994: 91004109     	add	x9, x8, #0x10
 37e2998: eb15013f     	cmp	x9, x21
 37e299c: fa558102     	ccmp	x8, x21, #0x2, hi
 37e29a0: 54ff93a9     	b.ls	0x37e1c14 <_ChromeMain+0x37dc978>
 37e29a4: 3dc002a0     	ldr	q0, [x21]
 37e29a8: 3d801fe0     	str	q0, [sp, #0x70]
 37e29ac: 790103ff     	strh	wzr, [sp, #0x80]
 37e29b0: 9101c3e1     	add	x1, sp, #0x70
 37e29b4: 97662bc9     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 37e29b8: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e29bc: 36f800a8     	tbz	w8, #0x1f, 0x37e29d0 <_ChromeMain+0x37dd734>
 37e29c0: f9403be0     	ldr	x0, [sp, #0x70]
 37e29c4: f94043e8     	ldr	x8, [sp, #0x80]
 37e29c8: d37ff901     	lsl	x1, x8, #1
 37e29cc: 9720993b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 37e29d0: aa1b03e0     	mov	x0, x27
 37e29d4: 943a1b1b     	bl	0x4669640 <_ChromeMain+0x46643a4>
 37e29d8: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e29dc: 91120108     	add	x8, x8, #0x480
 37e29e0: f8bfc100     	ldapr	x0, [x8]
 37e29e4: b4015780     	cbz	x0, 0x37e54d4 <_ChromeMain+0x37e0238>
 37e29e8: 52806401     	mov	w1, #0x320              ; =800
 37e29ec: d2800002     	mov	x2, #0x0                ; =0
 37e29f0: 972322f0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e29f4: aa0003f5     	mov	x21, x0
 37e29f8: 976e31d2     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e29fc: b0057a28     	adrp	x8, 0xe727000 <dyld_stub_binder+0xe727000>
 37e2a00: 913b4108     	add	x8, x8, #0xed0
 37e2a04: 910fa109     	add	x9, x8, #0x3e8
 37e2a08: a9002408     	stp	x8, x9, [x0]
 37e2a0c: 91104109     	add	x9, x8, #0x410
 37e2a10: f9000809     	str	x9, [x0, #0x10]
 37e2a14: 91112109     	add	x9, x8, #0x448
 37e2a18: 9111e10a     	add	x10, x8, #0x478
 37e2a1c: a906a809     	stp	x9, x10, [x0, #0x68]
 37e2a20: 91132109     	add	x9, x8, #0x4c8
 37e2a24: f9005809     	str	x9, [x0, #0xb0]
 37e2a28: 9114a109     	add	x9, x8, #0x528
 37e2a2c: aa0003f6     	mov	x22, x0
 37e2a30: f80d8ec9     	str	x9, [x22, #0xd8]!
 37e2a34: 91156108     	add	x8, x8, #0x558
 37e2a38: f9007c08     	str	x8, [x0, #0xf8]
 37e2a3c: 6f00e400     	movi.2d	v0, #0000000000000000
 37e2a40: 3d80c400     	str	q0, [x0, #0x310]
 37e2a44: 52802800     	mov	w0, #0x140              ; =320
 37e2a48: 9720b248     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e2a4c: aa0003f4     	mov	x20, x0
 37e2a50: 97c8b6e0     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e2a54: aa1503e0     	mov	x0, x21
 37e2a58: aa1403e1     	mov	x1, x20
 37e2a5c: 978e9b77     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e2a60: b940f288     	ldr	w8, [x20, #0xf0]
 37e2a64: 7100051f     	cmp	w8, #0x1
 37e2a68: 54010481     	b.ne	0x37e4af8 <_ChromeMain+0x37df85c>
 37e2a6c: 52800068     	mov	w8, #0x3                ; =3
 37e2a70: b90073e8     	str	w8, [sp, #0x70]
 37e2a74: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e2a78: 9115a021     	add	x1, x1, #0x568
 37e2a7c: 91046280     	add	x0, x20, #0x118
 37e2a80: 9101c3e2     	add	x2, sp, #0x70
 37e2a84: 978a09c8     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 37e2a88: b940fa88     	ldr	w8, [x20, #0xf8]
 37e2a8c: 7100051f     	cmp	w8, #0x1
 37e2a90: 540127c1     	b.ne	0x37e4f88 <_ChromeMain+0x37dfcec>
 37e2a94: b940fe88     	ldr	w8, [x20, #0xfc]
 37e2a98: 7100051f     	cmp	w8, #0x1
 37e2a9c: 54012761     	b.ne	0x37e4f88 <_ChromeMain+0x37dfcec>
 37e2aa0: b9410288     	ldr	w8, [x20, #0x100]
 37e2aa4: 35012728     	cbnz	w8, 0x37e4f88 <_ChromeMain+0x37dfcec>
 37e2aa8: b9410688     	ldr	w8, [x20, #0x104]
 37e2aac: 7100051f     	cmp	w8, #0x1
 37e2ab0: 540126c1     	b.ne	0x37e4f88 <_ChromeMain+0x37dfcec>
 37e2ab4: 3945a748     	ldrb	w8, [x26, #0x169]
 37e2ab8: 35015ce8     	cbnz	w8, 0x37e5654 <_ChromeMain+0x37e03b8>
 37e2abc: 910c42b4     	add	x20, x21, #0x310
 37e2ac0: f940cea2     	ldr	x2, [x21, #0x198]
 37e2ac4: aa1503e0     	mov	x0, x21
 37e2ac8: aa1a03e1     	mov	x1, x26
 37e2acc: 973e5a4c     	bl	0x7793fc <_ChromeMain+0x774160>
 37e2ad0: 925e7748     	and	x8, x26, #0xfffffffc00000000
 37e2ad4: f9404789     	ldr	x9, [x28, #0x88]
 37e2ad8: eb09011f     	cmp	x8, x9
 37e2adc: 54000061     	b.ne	0x37e2ae8 <_ChromeMain+0x37dd84c>
 37e2ae0: aa1a03e0     	mov	x0, x26
 37e2ae4: 9720c606     	bl	0x142fc <_ChromeMain+0xf060>
 37e2ae8: f9400280     	ldr	x0, [x20]
 37e2aec: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2af0: f9404789     	ldr	x9, [x28, #0x88]
 37e2af4: eb09011f     	cmp	x8, x9
 37e2af8: 54000041     	b.ne	0x37e2b00 <_ChromeMain+0x37dd864>
 37e2afc: 9720ffd0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e2b00: f900029a     	str	x26, [x20]
 37e2b04: 3945a768     	ldrb	w8, [x27, #0x169]
 37e2b08: 35015ac8     	cbnz	w8, 0x37e5660 <_ChromeMain+0x37e03c4>
 37e2b0c: f940cea2     	ldr	x2, [x21, #0x198]
 37e2b10: aa1503e0     	mov	x0, x21
 37e2b14: aa1b03e1     	mov	x1, x27
 37e2b18: 973e5a39     	bl	0x7793fc <_ChromeMain+0x774160>
 37e2b1c: 925e7768     	and	x8, x27, #0xfffffffc00000000
 37e2b20: f9404789     	ldr	x9, [x28, #0x88]
 37e2b24: eb09011f     	cmp	x8, x9
 37e2b28: f0ff6bd8     	adrp	x24, 0x255d000 <_ChromeMain+0x2557d64>
 37e2b2c: 912c0318     	add	x24, x24, #0xb00
 37e2b30: 54000061     	b.ne	0x37e2b3c <_ChromeMain+0x37dd8a0>
 37e2b34: aa1b03e0     	mov	x0, x27
 37e2b38: 9720c5f1     	bl	0x142fc <_ChromeMain+0xf060>
 37e2b3c: f9418ea0     	ldr	x0, [x21, #0x318]
 37e2b40: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2b44: f9404789     	ldr	x9, [x28, #0x88]
 37e2b48: eb09011f     	cmp	x8, x9
 37e2b4c: 54000041     	b.ne	0x37e2b54 <_ChromeMain+0x37dd8b8>
 37e2b50: 9720ffbb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e2b54: f9018ebb     	str	x27, [x21, #0x318]
 37e2b58: f9418ab4     	ldr	x20, [x21, #0x310]
 37e2b5c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e2b60: f9404789     	ldr	x9, [x28, #0x88]
 37e2b64: eb09011f     	cmp	x8, x9
 37e2b68: 54000061     	b.ne	0x37e2b74 <_ChromeMain+0x37dd8d8>
 37e2b6c: aa1403e0     	mov	x0, x20
 37e2b70: 9720c5e3     	bl	0x142fc <_ChromeMain+0xf060>
 37e2b74: f94002e0     	ldr	x0, [x23]
 37e2b78: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2b7c: f9404789     	ldr	x9, [x28, #0x88]
 37e2b80: eb09011f     	cmp	x8, x9
 37e2b84: 54000041     	b.ne	0x37e2b8c <_ChromeMain+0x37dd8f0>
 37e2b88: 9720ffad     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e2b8c: f90002f4     	str	x20, [x23]
 37e2b90: f9418eb4     	ldr	x20, [x21, #0x318]
 37e2b94: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e2b98: f9404789     	ldr	x9, [x28, #0x88]
 37e2b9c: eb09011f     	cmp	x8, x9
 37e2ba0: 54000061     	b.ne	0x37e2bac <_ChromeMain+0x37dd910>
 37e2ba4: aa1403e0     	mov	x0, x20
 37e2ba8: 9720c5d5     	bl	0x142fc <_ChromeMain+0xf060>
 37e2bac: f941b720     	ldr	x0, [x25, #0x368]
 37e2bb0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2bb4: f9404789     	ldr	x9, [x28, #0x88]
 37e2bb8: eb09011f     	cmp	x8, x9
 37e2bbc: d005b937     	adrp	x23, 0xef08000 <dyld_stub_binder+0xef08000>
 37e2bc0: 54000041     	b.ne	0x37e2bc8 <_ChromeMain+0x37dd92c>
 37e2bc4: 9720ff9e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e2bc8: f901b734     	str	x20, [x25, #0x368]
 37e2bcc: 3945a6a8     	ldrb	w8, [x21, #0x169]
 37e2bd0: 350154e8     	cbnz	w8, 0x37e566c <_ChromeMain+0x37e03d0>
 37e2bd4: f9418f20     	ldr	x0, [x25, #0x318]
 37e2bd8: f940cc02     	ldr	x2, [x0, #0x198]
 37e2bdc: aa1503e1     	mov	x1, x21
 37e2be0: 973e5a07     	bl	0x7793fc <_ChromeMain+0x774160>
 37e2be4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 37e2be8: f9404789     	ldr	x9, [x28, #0x88]
 37e2bec: eb09011f     	cmp	x8, x9
 37e2bf0: 54000061     	b.ne	0x37e2bfc <_ChromeMain+0x37dd960>
 37e2bf4: aa1503e0     	mov	x0, x21
 37e2bf8: 9720c5c1     	bl	0x142fc <_ChromeMain+0xf060>
 37e2bfc: f941b320     	ldr	x0, [x25, #0x360]
 37e2c00: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e2c04: f9404789     	ldr	x9, [x28, #0x88]
 37e2c08: eb09011f     	cmp	x8, x9
 37e2c0c: 54000041     	b.ne	0x37e2c14 <_ChromeMain+0x37dd978>
 37e2c10: 9720ff8b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e2c14: f901b335     	str	x21, [x25, #0x360]
 37e2c18: d2c000e8     	mov	x8, #0x700000000        ; =30064771072
 37e2c1c: 4e080d00     	dup.2d	v0, x8
 37e2c20: 3d801fe0     	str	q0, [sp, #0x70]
 37e2c24: f0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e2c28: 91122021     	add	x1, x1, #0x488
 37e2c2c: 9101c3e2     	add	x2, sp, #0x70
 37e2c30: aa1603e0     	mov	x0, x22
 37e2c34: 978c2c8b     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 37e2c38: 9005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e2c3c: 91120108     	add	x8, x8, #0x480
 37e2c40: f8bfc100     	ldapr	x0, [x8]
 37e2c44: b40144c0     	cbz	x0, 0x37e54dc <_ChromeMain+0x37e0240>
 37e2c48: 52806201     	mov	w1, #0x310              ; =784
 37e2c4c: d2800002     	mov	x2, #0x0                ; =0
 37e2c50: 97232258     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e2c54: aa0003f4     	mov	x20, x0
 37e2c58: 52806201     	mov	w1, #0x310              ; =784
 37e2c5c: 95209aed     	bl	0x8009810 <_ChromeMain+0x8004574>
 37e2c60: aa1403e0     	mov	x0, x20
 37e2c64: 976e3137     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e2c68: d0057a28     	adrp	x8, 0xe728000 <dyld_stub_binder+0xe728000>
 37e2c6c: 912f4108     	add	x8, x8, #0xbd0
 37e2c70: 910fa109     	add	x9, x8, #0x3e8
 37e2c74: a9002688     	stp	x8, x9, [x20]
 37e2c78: 91104109     	add	x9, x8, #0x410
 37e2c7c: f9000a89     	str	x9, [x20, #0x10]
 37e2c80: 91112109     	add	x9, x8, #0x448
 37e2c84: 9111e10a     	add	x10, x8, #0x478
 37e2c88: a906aa89     	stp	x9, x10, [x20, #0x68]
 37e2c8c: 91132109     	add	x9, x8, #0x4c8
