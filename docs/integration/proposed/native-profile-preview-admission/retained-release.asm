
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4641b54: d10103ff     	sub	sp, sp, #0x40
 4641b58: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4641b5c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4641b60: 9100c3fd     	add	x29, sp, #0x30
 4641b64: aa0003f3     	mov	x19, x0
 4641b68: f944b800     	ldr	x0, [x0, #0x970]
 4641b6c: b40001a0     	cbz	x0, 0x4641ba0 <_ChromeMain+0x463c904>
 4641b70: f9400008     	ldr	x8, [x0]
 4641b74: f9400908     	ldr	x8, [x8, #0x10]
 4641b78: f0ffe429     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4641b7c: 9123b129     	add	x9, x9, #0x8ec
 4641b80: eb09011f     	cmp	x8, x9
 4641b84: 540005c1     	b.ne	0x4641c3c <_ChromeMain+0x463c9a0>
 4641b88: f9401008     	ldr	x8, [x0, #0x20]
 4641b8c: b40000a8     	cbz	x8, 0x4641ba0 <_ChromeMain+0x463c904>
 4641b90: f9400c08     	ldr	x8, [x0, #0x18]
 4641b94: b8bfc108     	ldapr	w8, [x8]
 4641b98: 7100051f     	cmp	w8, #0x1
 4641b9c: 54000481     	b.ne	0x4641c2c <_ChromeMain+0x463c990>
 4641ba0: d004c440     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4641ba4: 91352800     	add	x0, x0, #0xd4a
 4641ba8: d004c441     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4641bac: 912c7821     	add	x1, x1, #0xb1e
 4641bb0: 910003e8     	mov	x8, sp
 4641bb4: 52860ba2     	mov	w2, #0x305d             ; =12381
 4641bb8: 96e83c32     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4641bbc: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4641bc0: b0052b89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4641bc4: f9404529     	ldr	x9, [x9, #0x88]
 4641bc8: eb09011f     	cmp	x8, x9
 4641bcc: 54000061     	b.ne	0x4641bd8 <_ChromeMain+0x463c93c>
 4641bd0: aa1303e0     	mov	x0, x19
 4641bd4: 96e749ca     	bl	0x142fc <_ChromeMain+0xf060>
 4641bd8: 52800700     	mov	w0, #0x38               ; =56
 4641bdc: 96e735e3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4641be0: aa0003e3     	mov	x3, x0
 4641be4: 52800028     	mov	w8, #0x1                ; =1
 4641be8: b9000008     	str	w8, [x0]
 4641bec: 90ffc7c8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 4641bf0: 913a0108     	add	x8, x8, #0xe80
 4641bf4: 90ff92c9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4641bf8: 912d0129     	add	x9, x9, #0xb40
 4641bfc: a900a408     	stp	x8, x9, [x0, #0x8]
 4641c00: 90fef8e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4641c04: 912c0108     	add	x8, x8, #0xb00
 4641c08: 10076569     	adr	x9, 0x46508b4 <_ChromeMain+0x464b618>
 4641c0c: d503201f     	nop
 4641c10: a901a408     	stp	x8, x9, [x0, #0x18]
 4641c14: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4641c18: 91250260     	add	x0, x19, #0x940
 4641c1c: 910003e1     	mov	x1, sp
 4641c20: 52942402     	mov	w2, #0xa120             ; =41248
 4641c24: 72a000e2     	movk	w2, #0x7, lsl #16
 4641c28: 96f9a237     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 4641c2c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4641c30: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4641c34: 910103ff     	add	sp, sp, #0x40
 4641c38: d65f03c0     	ret
 4641c3c: d63f0100     	blr	x8
 4641c40: 3707ff60     	tbnz	w0, #0x0, 0x4641c2c <_ChromeMain+0x463c990>
 4641c44: 17ffffd7     	b	0x4641ba0 <_ChromeMain+0x463c904>
