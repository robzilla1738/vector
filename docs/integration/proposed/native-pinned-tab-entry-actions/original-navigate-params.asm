
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 31cc6dc: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 31cc6e0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 31cc6e4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 31cc6e8: 910083fd     	add	x29, sp, #0x20
 31cc6ec: aa0303f5     	mov	x21, x3
 31cc6f0: aa0103f4     	mov	x20, x1
 31cc6f4: aa0003f3     	mov	x19, x0
 31cc6f8: aa0203e1     	mov	x1, x2
 31cc6fc: 973db626     	bl	0x139f94 <_ChromeMain+0x134cf8>
 31cc700: a907fc1f     	stp	xzr, xzr, [x0, #0x78]
 31cc704: b808f01f     	stur	wzr, [x0, #0x8f]
 31cc708: f900441f     	str	xzr, [x0, #0x88]
 31cc70c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 31cc710: 3c898000     	stur	q0, [x0, #0x98]
 31cc714: 3c8a8000     	stur	q0, [x0, #0xa8]
 31cc718: 3c8b8000     	stur	q0, [x0, #0xb8]
 31cc71c: 3c8c8000     	stur	q0, [x0, #0xc8]
 31cc720: 7901b01f     	strh	wzr, [x0, #0xd8]
 31cc724: a90e7c1f     	stp	xzr, xzr, [x0, #0xe0]
 31cc728: 52800028     	mov	w8, #0x1                ; =1
 31cc72c: b900f008     	str	w8, [x0, #0xf0]
 31cc730: 3903e01f     	strb	wzr, [x0, #0xf8]
 31cc734: 3904201f     	strb	wzr, [x0, #0x108]
 31cc738: 12800009     	mov	w9, #-0x1               ; =-1
 31cc73c: b9011009     	str	w9, [x0, #0x110]
 31cc740: 3904601f     	strb	wzr, [x0, #0x118]
 31cc744: 3905a01f     	strb	wzr, [x0, #0x168]
 31cc748: 3905c01f     	strb	wzr, [x0, #0x170]
 31cc74c: 3907a01f     	strb	wzr, [x0, #0x1e8]
 31cc750: 6f00e400     	movi.2d	v0, #0000000000000000
 31cc754: ad0f8000     	stp	q0, q0, [x0, #0x1f0]
 31cc758: b9021009     	str	w9, [x0, #0x210]
 31cc75c: 91086009     	add	x9, x0, #0x218
 31cc760: ad000120     	stp	q0, q0, [x9]
 31cc764: ad010120     	stp	q0, q0, [x9, #0x20]
 31cc768: 3d801120     	str	q0, [x9, #0x40]
 31cc76c: f901341f     	str	xzr, [x0, #0x268]
 31cc770: b9027008     	str	w8, [x0, #0x270]
 31cc774: f9013c1f     	str	xzr, [x0, #0x278]
 31cc778: 7905001f     	strh	wzr, [x0, #0x280]
 31cc77c: b9028415     	str	w21, [x0, #0x284]
 31cc780: 390a201f     	strb	wzr, [x0, #0x288]
 31cc784: 910a3008     	add	x8, x0, #0x28c
 31cc788: b24083e9     	mov	x9, #0x1ffffffff        ; =8589934591
 31cc78c: f9000109     	str	x9, [x8]
 31cc790: 910a6008     	add	x8, x0, #0x298
 31cc794: 6f00e401     	movi.2d	v1, #0000000000000000
 31cc798: fd016401     	str	d1, [x0, #0x2c8]
 31cc79c: ad000100     	stp	q0, q0, [x8]
 31cc7a0: 3c81d100     	stur	q0, [x8, #0x1d]
 31cc7a4: 52802028     	mov	w8, #0x101              ; =257
 31cc7a8: 7905a008     	strh	w8, [x0, #0x2d0]
 31cc7ac: b902d41f     	str	wzr, [x0, #0x2d4]
 31cc7b0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 31cc7b4: d005cf29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 31cc7b8: f9404529     	ldr	x9, [x9, #0x88]
 31cc7bc: eb09011f     	cmp	x8, x9
 31cc7c0: 54000061     	b.ne	0x31cc7cc <_ChromeMain+0x31c7530>
 31cc7c4: aa1403e0     	mov	x0, x20
 31cc7c8: 97391ecd     	bl	0x142fc <_ChromeMain+0xf060>
 31cc7cc: f9016e74     	str	x20, [x19, #0x2d8]
 31cc7d0: 390b827f     	strb	wzr, [x19, #0x2e0]
 31cc7d4: 390bc27f     	strb	wzr, [x19, #0x2f0]
 31cc7d8: 390be27f     	strb	wzr, [x19, #0x2f8]
 31cc7dc: 910c0268     	add	x8, x19, #0x300
 31cc7e0: f901967f     	str	xzr, [x19, #0x328]
 31cc7e4: b903327f     	str	wzr, [x19, #0x330]
 31cc7e8: 910ce269     	add	x9, x19, #0x338
 31cc7ec: 390d627f     	strb	wzr, [x19, #0x358]
 31cc7f0: 390dc27f     	strb	wzr, [x19, #0x370]
 31cc7f4: 390de27f     	strb	wzr, [x19, #0x378]
 31cc7f8: 390e027f     	strb	wzr, [x19, #0x380]
 31cc7fc: 3913e27f     	strb	wzr, [x19, #0x4f8]
 31cc800: f901827f     	str	xzr, [x19, #0x300]
 31cc804: b800711f     	stur	wzr, [x8, #0x7]
 31cc808: 6f00e400     	movi.2d	v0, #0000000000000000
 31cc80c: 3d80c660     	str	q0, [x19, #0x310]
 31cc810: 390c827f     	strb	wzr, [x19, #0x320]
 31cc814: f9019e7f     	str	xzr, [x19, #0x338]
 31cc818: f901a67f     	str	xzr, [x19, #0x348]
 31cc81c: f901a27f     	str	xzr, [x19, #0x340]
 31cc820: f801613f     	stur	xzr, [x9, #0x16]
 31cc824: aa1303e0     	mov	x0, x19
 31cc828: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 31cc82c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 31cc830: a8c357f6     	ldp	x22, x21, [sp], #0x30
 31cc834: d65f03c0     	ret
