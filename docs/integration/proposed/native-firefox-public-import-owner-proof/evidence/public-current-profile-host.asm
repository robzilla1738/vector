
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263a68: d10243ff     	sub	sp, sp, #0x90
 4263a6c: a9036ffc     	stp	x28, x27, [sp, #0x30]
 4263a70: a90467fa     	stp	x26, x25, [sp, #0x40]
 4263a74: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4263a78: a90657f6     	stp	x22, x21, [sp, #0x60]
 4263a7c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4263a80: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4263a84: 910203fd     	add	x29, sp, #0x80
 4263a88: aa0303f4     	mov	x20, x3
 4263a8c: aa0203f3     	mov	x19, x2
 4263a90: aa0103f5     	mov	x21, x1
 4263a94: aa0003f6     	mov	x22, x0
 4263a98: f9400c17     	ldr	x23, [x0, #0x18]
 4263a9c: f0054a79     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4263aa0: b4000117     	cbz	x23, 0x4263ac0 <_ChromeMain+0x425e824>
 4263aa4: f9401ae0     	ldr	x0, [x23, #0x30]
 4263aa8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263aac: f9404729     	ldr	x9, [x25, #0x88]
 4263ab0: eb09011f     	cmp	x8, x9
 4263ab4: 54000041     	b.ne	0x4263abc <_ChromeMain+0x425e820>
 4263ab8: 96f70be3     	bl	0x26a44 <_ChromeMain+0x217a8>
 4263abc: f9001aff     	str	xzr, [x23, #0x30]
 4263ac0: 52802600     	mov	w0, #0x130              ; =304
 4263ac4: 96f6ae29     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263ac8: aa0003f7     	mov	x23, x0
 4263acc: 94d6f292     	bl	0x7820514 <_ChromeMain+0x781b278>
 4263ad0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263ad4: f9404729     	ldr	x9, [x25, #0x88]
 4263ad8: eb09011f     	cmp	x8, x9
 4263adc: 54000061     	b.ne	0x4263ae8 <_ChromeMain+0x425e84c>
 4263ae0: aa1703e0     	mov	x0, x23
 4263ae4: 96f6c206     	bl	0x142fc <_ChromeMain+0xf060>
 4263ae8: f9400ec0     	ldr	x0, [x22, #0x18]
 4263aec: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263af0: f9404729     	ldr	x9, [x25, #0x88]
 4263af4: eb09011f     	cmp	x8, x9
 4263af8: 54000041     	b.ne	0x4263b00 <_ChromeMain+0x425e864>
 4263afc: 96f70bd2     	bl	0x26a44 <_ChromeMain+0x217a8>
 4263b00: f9000ed7     	str	x23, [x22, #0x18]
 4263b04: aa1703e0     	mov	x0, x23
 4263b08: aa1603e1     	mov	x1, x22
 4263b0c: 94db2079     	bl	0x792bcf0 <_ChromeMain+0x7926a54>
 4263b10: f9400ed8     	ldr	x24, [x22, #0x18]
 4263b14: f94006c0     	ldr	x0, [x22, #0x8]
 4263b18: b4000500     	cbz	x0, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263b1c: f0056408     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4263b20: f9467d08     	ldr	x8, [x8, #0xcf8]
 4263b24: f9414908     	ldr	x8, [x8, #0x290]
 4263b28: f9400517     	ldr	x23, [x8, #0x8]
 4263b2c: 970cf272     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4263b30: b4000440     	cbz	x0, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263b34: f9402808     	ldr	x8, [x0, #0x50]
 4263b38: b5000068     	cbnz	x8, 0x4263b44 <_ChromeMain+0x425e8a8>
 4263b3c: f9402409     	ldr	x9, [x0, #0x48]
 4263b40: b40003c9     	cbz	x9, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263b44: 52800a09     	mov	w9, #0x50               ; =80
 4263b48: 5280090a     	mov	w10, #0x48              ; =72
 4263b4c: f100011f     	cmp	x8, #0x0
 4263b50: 9a890148     	csel	x8, x10, x9, eq
 4263b54: f8686808     	ldr	x8, [x0, x8]
 4263b58: f9400908     	ldr	x8, [x8, #0x10]
 4263b5c: f940051a     	ldr	x26, [x8, #0x8]
 4263b60: b40002da     	cbz	x26, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263b64: 9100a348     	add	x8, x26, #0x28
 4263b68: 3900bfff     	strb	wzr, [sp, #0x2f]
 4263b6c: 9100bfe9     	add	x9, sp, #0x2f
 4263b70: a901a3e9     	stp	x9, x8, [sp, #0x18]
 4263b74: d0fe5a62     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4263b78: 912dc042     	add	x2, x2, #0xb70
 4263b7c: 910063e1     	add	x1, sp, #0x18
 4263b80: aa1703e0     	mov	x0, x23
 4263b84: 52800003     	mov	w3, #0x0                ; =0
 4263b88: 52800004     	mov	w4, #0x0                ; =0
 4263b8c: 972d3739     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4263b90: 3940bfe8     	ldrb	w8, [sp, #0x2f]
 4263b94: 34000128     	cbz	w8, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263b98: f9403f40     	ldr	x0, [x26, #0x78]
 4263b9c: b40000e0     	cbz	x0, 0x4263bb8 <_ChromeMain+0x425e91c>
 4263ba0: f9400008     	ldr	x8, [x0]
 4263ba4: f9401109     	ldr	x9, [x8, #0x20]
 4263ba8: 910023e8     	add	x8, sp, #0x8
 4263bac: d63f0120     	blr	x9
 4263bb0: f94007e0     	ldr	x0, [sp, #0x8]
 4263bb4: 14000005     	b	0x4263bc8 <_ChromeMain+0x425e92c>
 4263bb8: 52800100     	mov	w0, #0x8                ; =8
 4263bbc: 96f6adeb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263bc0: f900001f     	str	xzr, [x0]
 4263bc4: a900ffe0     	stp	x0, xzr, [sp, #0x8]
 4263bc8: 95102151     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4263bcc: aa0003f7     	mov	x23, x0
 4263bd0: f9401300     	ldr	x0, [x24, #0x20]
 4263bd4: aa1703e1     	mov	x1, x23
 4263bd8: 9510214a     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4263bdc: aa1703e0     	mov	x0, x23
 4263be0: 94f67edf     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4263be4: f9400be8     	ldr	x8, [sp, #0x10]
 4263be8: f9001708     	str	x8, [x24, #0x28]
 4263bec: f94007f7     	ldr	x23, [sp, #0x8]
 4263bf0: f90007ff     	str	xzr, [sp, #0x8]
 4263bf4: b40000d7     	cbz	x23, 0x4263c0c <_ChromeMain+0x425e970>
 4263bf8: aa1703e0     	mov	x0, x23
 4263bfc: 95102147     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4263c00: aa1703e0     	mov	x0, x23
 4263c04: 52800101     	mov	w1, #0x8                ; =8
 4263c08: 96f694ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263c0c: 925e769a     	and	x26, x20, #0xfffffffc00000000
 4263c10: f9404728     	ldr	x8, [x25, #0x88]
 4263c14: eb08035f     	cmp	x26, x8
 4263c18: 54000061     	b.ne	0x4263c24 <_ChromeMain+0x425e988>
 4263c1c: aa1403e0     	mov	x0, x20
 4263c20: 96f6c1b7     	bl	0x142fc <_ChromeMain+0xf060>
 4263c24: f94012c0     	ldr	x0, [x22, #0x20]
 4263c28: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4263c2c: f9404729     	ldr	x9, [x25, #0x88]
 4263c30: eb09011f     	cmp	x8, x9
 4263c34: 54000041     	b.ne	0x4263c3c <_ChromeMain+0x425e9a0>
 4263c38: 96f6fb81     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4263c3c: f90012d4     	str	x20, [x22, #0x20]
 4263c40: 394122c8     	ldrb	w8, [x22, #0x48]
 4263c44: 37000488     	tbnz	w8, #0x0, 0x4263cd4 <_ChromeMain+0x425ea38>
 4263c48: f9400edb     	ldr	x27, [x22, #0x18]
 4263c4c: f9405ad7     	ldr	x23, [x22, #0xb0]
 4263c50: b40000d7     	cbz	x23, 0x4263c68 <_ChromeMain+0x425e9cc>
 4263c54: 52800028     	mov	w8, #0x1                ; =1
 4263c58: b82802e8     	ldadd	w8, w8, [x23]
 4263c5c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4263c60: 6b09011f     	cmp	w8, w9
 4263c64: 54000b60     	b.eq	0x4263dd0 <_ChromeMain+0x425eb34>
 4263c68: f9405edc     	ldr	x28, [x22, #0xb8]
 4263c6c: 52800b00     	mov	w0, #0x58               ; =88
 4263c70: 96f6adbe     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263c74: aa0003f8     	mov	x24, x0
 4263c78: 52800028     	mov	w8, #0x1                ; =1
 4263c7c: b9000008     	str	w8, [x0]
 4263c80: 10007388     	adr	x8, 0x4264af0 <_ChromeMain+0x425f854>
 4263c84: d503201f     	nop
 4263c88: f0fff029     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 4263c8c: 913a0129     	add	x9, x9, #0xe80
 4263c90: a900a408     	stp	x8, x9, [x0, #0x8]
 4263c94: f0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4263c98: 911b0108     	add	x8, x8, #0x6c0
 4263c9c: 10001569     	adr	x9, 0x4263f48 <_ChromeMain+0x425ecac>
 4263ca0: d503201f     	nop
 4263ca4: a901a408     	stp	x8, x9, [x0, #0x18]
 4263ca8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4263cac: f9001c1c     	str	x28, [x0, #0x38]
 4263cb0: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 4263cb4: 37f80488     	tbnz	w8, #0x1f, 0x4263d44 <_ChromeMain+0x425eaa8>
 4263cb8: 3cc202a0     	ldur	q0, [x21, #0x20]
 4263cbc: 3c840300     	stur	q0, [x24, #0x40]
 4263cc0: f84302a8     	ldur	x8, [x21, #0x30]
 4263cc4: f8050308     	stur	x8, [x24, #0x50]
 4263cc8: f9403777     	ldr	x23, [x27, #0x68]
 4263ccc: f9003778     	str	x24, [x27, #0x68]
 4263cd0: b5000437     	cbnz	x23, 0x4263d54 <_ChromeMain+0x425eab8>
 4263cd4: f9400ed6     	ldr	x22, [x22, #0x18]
 4263cd8: 52800300     	mov	w0, #0x18               ; =24
 4263cdc: 96f6ada3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263ce0: aa0003f7     	mov	x23, x0
 4263ce4: b900081f     	str	wzr, [x0, #0x8]
 4263ce8: b004fa68     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 4263cec: 9110e108     	add	x8, x8, #0x438
 4263cf0: f9000008     	str	x8, [x0]
 4263cf4: f9404728     	ldr	x8, [x25, #0x88]
 4263cf8: eb08035f     	cmp	x26, x8
 4263cfc: 54000061     	b.ne	0x4263d08 <_ChromeMain+0x425ea6c>
 4263d00: aa1403e0     	mov	x0, x20
 4263d04: 96f6c17e     	bl	0x142fc <_ChromeMain+0xf060>
 4263d08: f9000af4     	str	x20, [x23, #0x10]
 4263d0c: aa1603e0     	mov	x0, x22
 4263d10: aa1503e1     	mov	x1, x21
 4263d14: aa1403e2     	mov	x2, x20
 4263d18: aa1303e3     	mov	x3, x19
 4263d1c: aa1703e4     	mov	x4, x23
 4263d20: 97fa8916     	bl	0x4106178 <_ChromeMain+0x4100edc>
 4263d24: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4263d28: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4263d2c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4263d30: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4263d34: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4263d38: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 4263d3c: 910243ff     	add	sp, sp, #0x90
 4263d40: d65f03c0     	ret
