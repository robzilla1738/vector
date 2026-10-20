
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4250878: d10243ff     	sub	sp, sp, #0x90
 425087c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4250880: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4250884: 910203fd     	add	x29, sp, #0x80
 4250888: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 425088c: f81e03bf     	stur	xzr, [x29, #-0x20]
 4250890: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4250894: 36f802a8     	tbz	w8, #0x1f, 0x42508e8 <_ChromeMain+0x424b64c>
 4250898: a9400801     	ldp	x1, x2, [x0]
 425089c: d100c3a0     	sub	x0, x29, #0x30
 42508a0: 96f71e5e     	bl	0x18218 <_ChromeMain+0x12f7c>
 42508a4: 385e73a9     	ldurb	w9, [x29, #-0x19]
 42508a8: 13001d28     	sxtb	w8, w9
 42508ac: f85d83aa     	ldur	x10, [x29, #-0x28]
 42508b0: 7100011f     	cmp	w8, #0x0
 42508b4: 9a894143     	csel	x3, x10, x9, mi
 42508b8: b5000223     	cbnz	x3, 0x42508fc <_ChromeMain+0x424b660>
 42508bc: 52800014     	mov	w20, #0x0               ; =0
 42508c0: 363800a8     	tbz	w8, #0x7, 0x42508d4 <_ChromeMain+0x424b638>
 42508c4: f85d03a0     	ldur	x0, [x29, #-0x30]
 42508c8: f85e03a8     	ldur	x8, [x29, #-0x20]
 42508cc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42508d0: 96f6e17a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42508d4: aa1403e0     	mov	x0, x20
 42508d8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 42508dc: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 42508e0: 910243ff     	add	sp, sp, #0x90
 42508e4: d65f03c0     	ret
 42508e8: 3dc00000     	ldr	q0, [x0]
 42508ec: 3c9d03a0     	stur	q0, [x29, #-0x30]
 42508f0: f9400808     	ldr	x8, [x0, #0x10]
 42508f4: f81e03a8     	stur	x8, [x29, #-0x20]
 42508f8: 17ffffeb     	b	0x42508a4 <_ChromeMain+0x424b608>
 42508fc: f85d03a9     	ldur	x9, [x29, #-0x30]
 4250900: 7100011f     	cmp	w8, #0x0
 4250904: d100c3a8     	sub	x8, x29, #0x30
 4250908: 9a884121     	csel	x1, x9, x8, mi
 425090c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 4250910: f9001fff     	str	xzr, [sp, #0x38]
 4250914: 9100e3e0     	add	x0, sp, #0x38
 4250918: 8b030022     	add	x2, x1, x3
 425091c: 944c8c43     	bl	0x5573a28 <_ChromeMain+0x556e78c>
 4250920: a9438be8     	ldp	x8, x2, [sp, #0x38]
 4250924: aa020109     	orr	x9, x8, x2
 4250928: f100013f     	cmp	x9, #0x0
 425092c: 9a9f1501     	csinc	x1, x8, xzr, ne
 4250930: 9100a3e0     	add	x0, sp, #0x28
 4250934: 96f7dadd     	bl	0x474a8 <_ChromeMain+0x4220c>
 4250938: a94287e0     	ldp	x0, x1, [sp, #0x28]
 425093c: 9422c081     	bl	0x4b00b40 <_ChromeMain+0x4afb8a4>
 4250940: aa0003f3     	mov	x19, x0
 4250944: f90013e0     	str	x0, [sp, #0x20]
 4250948: 9422b876     	bl	0x4afeb20 <_ChromeMain+0x4af9884>
 425094c: 360001e0     	tbz	w0, #0x0, 0x4250988 <_ChromeMain+0x424b6ec>
 4250950: 52800014     	mov	w20, #0x0               ; =0
 4250954: b4000073     	cbz	x19, 0x4250960 <_ChromeMain+0x424b6c4>
 4250958: 910083e0     	add	x0, sp, #0x20
 425095c: 9422b83d     	bl	0x4afea50 <_ChromeMain+0x4af97b4>
 4250960: f9401fe0     	ldr	x0, [sp, #0x38]
 4250964: b40000c0     	cbz	x0, 0x425097c <_ChromeMain+0x424b6e0>
 4250968: f94023e8     	ldr	x8, [sp, #0x40]
 425096c: cb0003e9     	neg	x9, x0
 4250970: eb09011f     	cmp	x8, x9
 4250974: 54000489     	b.ls	0x4250a04 <_ChromeMain+0x424b768>
 4250978: d4200020     	brk	#0x1
 425097c: 385e73a8     	ldurb	w8, [x29, #-0x19]
 4250980: 373ffa28     	tbnz	w8, #0x7, 0x42508c4 <_ChromeMain+0x424b628>
 4250984: 17ffffd4     	b	0x42508d4 <_ChromeMain+0x424b638>
 4250988: aa1303e0     	mov	x0, x19
 425098c: 95fa754d     	bl	0xc0edec0 <_ChromeMain+0xc0e8c24>
 4250990: aa0003f4     	mov	x20, x0
 4250994: a90103ff     	stp	xzr, x0, [sp, #0x10]
 4250998: a9007fff     	stp	xzr, xzr, [sp]
 425099c: 910003e2     	mov	x2, sp
 42509a0: 52800001     	mov	w1, #0x0                ; =0
 42509a4: 9422be38     	bl	0x4b00284 <_ChromeMain+0x4afafe8>
 42509a8: 37000180     	tbnz	w0, #0x0, 0x42509d8 <_ChromeMain+0x424b73c>
 42509ac: 910003e2     	mov	x2, sp
 42509b0: aa1403e0     	mov	x0, x20
 42509b4: 52800061     	mov	w1, #0x3                ; =3
 42509b8: 9422be33     	bl	0x4b00284 <_ChromeMain+0x4afafe8>
 42509bc: 370000e0     	tbnz	w0, #0x0, 0x42509d8 <_ChromeMain+0x424b73c>
 42509c0: 910003e2     	mov	x2, sp
 42509c4: aa1403e0     	mov	x0, x20
 42509c8: 52800021     	mov	w1, #0x1                ; =1
 42509cc: 9422be2e     	bl	0x4b00284 <_ChromeMain+0x4afafe8>
 42509d0: aa0003f4     	mov	x20, x0
 42509d4: 14000002     	b	0x42509dc <_ChromeMain+0x424b740>
 42509d8: 52800034     	mov	w20, #0x1               ; =1
 42509dc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 42509e0: 36f800a8     	tbz	w8, #0x1f, 0x42509f4 <_ChromeMain+0x424b758>
 42509e4: f94003e0     	ldr	x0, [sp]
 42509e8: f9400be8     	ldr	x8, [sp, #0x10]
 42509ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42509f0: 96f6e132     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42509f4: 910063e0     	add	x0, sp, #0x18
 42509f8: 9422b833     	bl	0x4afeac4 <_ChromeMain+0x4af9828>
 42509fc: b5fffaf3     	cbnz	x19, 0x4250958 <_ChromeMain+0x424b6bc>
 4250a00: 17ffffd8     	b	0x4250960 <_ChromeMain+0x424b6c4>
 4250a04: f90023ff     	str	xzr, [sp, #0x40]
 4250a08: f94027e1     	ldr	x1, [sp, #0x48]
 4250a0c: 96f6e12b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250a10: 17ffffdb     	b	0x425097c <_ChromeMain+0x424b6e0>
