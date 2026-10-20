
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
