
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7820514: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7820518: a9017bfd     	stp	x29, x30, [sp, #0x10]
 782051c: 910043fd     	add	x29, sp, #0x10
 7820520: aa0003f3     	mov	x19, x0
 7820524: 96a72c21     	bl	0x21eb5a8 <_ChromeMain+0x21e630c>
 7820528: 90034c88     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 782052c: 910b4108     	add	x8, x8, #0x2d0
 7820530: f9000008     	str	x8, [x0]
 7820534: 3900601f     	strb	wzr, [x0, #0x18]
 7820538: 91008000     	add	x0, x0, #0x20
 782053c: 96fc643e     	bl	0x3739634 <_ChromeMain+0x3734398>
 7820540: a9037e7f     	stp	xzr, xzr, [x19, #0x30]
 7820544: f900227f     	str	xzr, [x19, #0x40]
 7820548: 925e7668     	and	x8, x19, #0xfffffffc00000000
 782054c: d0039c89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7820550: f9404529     	ldr	x9, [x9, #0x88]
 7820554: eb09011f     	cmp	x8, x9
 7820558: 54000061     	b.ne	0x7820564 <_ChromeMain+0x781b2c8>
 782055c: aa1303e0     	mov	x0, x19
 7820560: 961fcf67     	bl	0x142fc <_ChromeMain+0xf060>
 7820564: a904fe73     	stp	x19, xzr, [x19, #0x48]
 7820568: 91016260     	add	x0, x19, #0x58
 782056c: 963c4005     	bl	0x730580 <_ChromeMain+0x72b2e4>
 7820570: 52800028     	mov	w8, #0x1                ; =1
 7820574: 39018268     	strb	w8, [x19, #0x60]
 7820578: f900367f     	str	xzr, [x19, #0x68]
 782057c: 7900e27f     	strh	wzr, [x19, #0x70]
 7820580: a907fe7f     	stp	xzr, xzr, [x19, #0x78]
 7820584: 91022260     	add	x0, x19, #0x88
 7820588: 97e749c3     	bl	0x71f2c94 <_ChromeMain+0x71ed9f8>
 782058c: 7902227f     	strh	wzr, [x19, #0x110]
 7820590: 39044a7f     	strb	wzr, [x19, #0x112]
 7820594: 3904527f     	strb	wzr, [x19, #0x114]
 7820598: 3904727f     	strb	wzr, [x19, #0x11c]
 782059c: 91048260     	add	x0, x19, #0x120
 78205a0: aa1303e1     	mov	x1, x19
 78205a4: 966c5f83     	bl	0x13383b0 <_ChromeMain+0x1333114>
 78205a8: aa1303e0     	mov	x0, x19
 78205ac: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78205b0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78205b4: d65f03c0     	ret
 78205b8: 17ffffd7     	b	0x7820514 <_ChromeMain+0x781b278>
 78205bc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78205c0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78205c4: 910043fd     	add	x29, sp, #0x10
 78205c8: aa0003f3     	mov	x19, x0
 78205cc: 52800028     	mov	w8, #0x1                ; =1
 78205d0: 39044808     	strb	w8, [x0, #0x112]
 78205d4: f9404000     	ldr	x0, [x0, #0x80]
 78205d8: b4000040     	cbz	x0, 0x78205e0 <_ChromeMain+0x781b344>
 78205dc: 97fff5a1     	bl	0x781dc60 <_ChromeMain+0x78189c4>
 78205e0: aa1303e0     	mov	x0, x19
 78205e4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78205e8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78205ec: 14000001     	b	0x78205f0 <_ChromeMain+0x781b354>
 78205f0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78205f4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78205f8: 910043fd     	add	x29, sp, #0x10
 78205fc: aa0003f3     	mov	x19, x0
 7820600: f9401c00     	ldr	x0, [x0, #0x38]
 7820604: f9001e7f     	str	xzr, [x19, #0x38]
 7820608: b4000080     	cbz	x0, 0x7820618 <_ChromeMain+0x781b37c>
 782060c: 94000169     	bl	0x7820bb0 <_ChromeMain+0x781b914>
 7820610: 52800701     	mov	w1, #0x38               ; =56
 7820614: 961fa229     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7820618: f9401a60     	ldr	x0, [x19, #0x30]
 782061c: b4000080     	cbz	x0, 0x782062c <_ChromeMain+0x781b390>
 7820620: f9400008     	ldr	x8, [x0]
 7820624: f9400d08     	ldr	x8, [x8, #0x18]
 7820628: d63f0100     	blr	x8
 782062c: b5000093     	cbnz	x19, 0x782063c <_ChromeMain+0x781b3a0>
 7820630: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7820634: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7820638: d65f03c0     	ret
 782063c: aa1303e0     	mov	x0, x19
 7820640: 9400007a     	bl	0x7820828 <_ChromeMain+0x781b58c>
 7820644: 52802601     	mov	w1, #0x130              ; =304
 7820648: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 782064c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7820650: 161fa21a     	b	0x8eb8 <_ChromeMain+0x3c1c>
