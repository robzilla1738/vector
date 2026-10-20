
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462bffc: f9422c08     	ldr	x8, [x0, #0x458]
 462c000: b4000528     	cbz	x8, 0x462c0a4 <_ChromeMain+0x4626e08>
 462c004: d100c3ff     	sub	sp, sp, #0x30
 462c008: a9014ff4     	stp	x20, x19, [sp, #0x10]
 462c00c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 462c010: 910083fd     	add	x29, sp, #0x20
 462c014: aa0103f3     	mov	x19, x1
 462c018: b4000401     	cbz	x1, 0x462c098 <_ChromeMain+0x4626dfc>
 462c01c: f9429914     	ldr	x20, [x8, #0x530]
 462c020: b40003d4     	cbz	x20, 0x462c098 <_ChromeMain+0x4626dfc>
 462c024: 2d510440     	ldp	s0, s1, [x2, #0x88]
 462c028: 1e254000     	frintm	s0, s0
 462c02c: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 462c030: 1e222000     	fcmp	s0, s2
 462c034: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 462c038: 1a88b3e9     	csel	w9, wzr, w8, lt
 462c03c: 1e226803     	fmaxnm	s3, s0, s2
 462c040: 1e38006a     	fcvtzs	w10, s3
 462c044: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 462c048: 1e270163     	fmov	s3, w11
 462c04c: 1e232000     	fcmp	s0, s3
 462c050: 1a899149     	csel	w9, w10, w9, ls
 462c054: 1e254020     	frintm	s0, s1
 462c058: 1e222000     	fcmp	s0, s2
 462c05c: 1a88b3e8     	csel	w8, wzr, w8, lt
 462c060: 1e226801     	fmaxnm	s1, s0, s2
 462c064: 1e38002a     	fcvtzs	w10, s1
 462c068: 1e232000     	fcmp	s0, s3
 462c06c: 1a889148     	csel	w8, w10, w8, ls
 462c070: aa088128     	orr	x8, x9, x8, lsl #32
 462c074: f90007e8     	str	x8, [sp, #0x8]
 462c078: 910023e1     	add	x1, sp, #0x8
 462c07c: aa1303e0     	mov	x0, x19
 462c080: 9773de4d     	bl	0x23239b4 <_ChromeMain+0x231e718>
 462c084: 910023e2     	add	x2, sp, #0x8
 462c088: aa1403e0     	mov	x0, x20
 462c08c: aa1303e1     	mov	x1, x19
 462c090: 52800023     	mov	w3, #0x1                ; =1
 462c094: 97fe3c9e     	bl	0x45bb30c <_ChromeMain+0x45b6070>
 462c098: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 462c09c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 462c0a0: 9100c3ff     	add	sp, sp, #0x30
 462c0a4: d65f03c0     	ret
