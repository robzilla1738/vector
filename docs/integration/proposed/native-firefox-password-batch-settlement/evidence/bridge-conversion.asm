
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 410667c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4106680: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4106684: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4106688: 910083fd     	add	x29, sp, #0x20
 410668c: d12183ff     	sub	sp, sp, #0x860
 4106690: a93cffbf     	stp	xzr, xzr, [x29, #-0x38]
 4106694: f81d83bf     	stur	xzr, [x29, #-0x28]
 4106698: f9400434     	ldr	x20, [x1, #0x8]
 410669c: b5000514     	cbnz	x20, 0x410673c <_ChromeMain+0x41014a0>
 41066a0: f9400800     	ldr	x0, [x0, #0x10]
 41066a4: d100e3a1     	sub	x1, x29, #0x38
 41066a8: 940000d9     	bl	0x4106a0c <_ChromeMain+0x4101770>
 41066ac: f85c83b3     	ldur	x19, [x29, #-0x38]
 41066b0: b5000113     	cbnz	x19, 0x41066d0 <_ChromeMain+0x4101434>
 41066b4: 912183ff     	add	sp, sp, #0x860
 41066b8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41066bc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41066c0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41066c4: d65f03c0     	ret
 41066c8: aa1303e0     	mov	x0, x19
 41066cc: 1400000f     	b	0x4106708 <_ChromeMain+0x410146c>
 41066d0: f85d03a8     	ldur	x8, [x29, #-0x30]
 41066d4: 52810609     	mov	w9, #0x830              ; =2096
 41066d8: 9b097d09     	mul	x9, x8, x9
 41066dc: b4ffff69     	cbz	x9, 0x41066c8 <_ChromeMain+0x410142c>
 41066e0: 8b130129     	add	x9, x9, x19
 41066e4: d120c120     	sub	x0, x9, #0x830
 41066e8: 928105e9     	mov	x9, #-0x830             ; =-2096
 41066ec: 9b097d14     	mul	x20, x8, x9
 41066f0: b4000760     	cbz	x0, 0x41067dc <_ChromeMain+0x4101540>
 41066f4: 94b18b0a     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 41066f8: d120c000     	sub	x0, x0, #0x830
 41066fc: b120c294     	adds	x20, x20, #0x830
 4106700: 54ffff81     	b.ne	0x41066f0 <_ChromeMain+0x4101454>
 4106704: f85c83a0     	ldur	x0, [x29, #-0x38]
 4106708: cb000268     	sub	x8, x19, x0
 410670c: 9344fd08     	asr	x8, x8, #4
 4106710: d289c569     	mov	x9, #0x4e2b             ; =20011
 4106714: f2b92909     	movk	x9, #0xc948, lsl #16
 4106718: f2d19669     	movk	x9, #0x8cb3, lsl #32
 410671c: f2e07d09     	movk	x9, #0x3e8, lsl #48
 4106720: 9b097d08     	mul	x8, x8, x9
 4106724: f81d03a8     	stur	x8, [x29, #-0x30]
 4106728: f85d83a8     	ldur	x8, [x29, #-0x28]
 410672c: 52810609     	mov	w9, #0x830              ; =2096
 4106730: 9b097d01     	mul	x1, x8, x9
 4106734: 96fc09e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4106738: 17ffffdf     	b	0x41066b4 <_ChromeMain+0x4101418>
 410673c: a90083e2     	stp	x2, x0, [sp, #0x8]
 4106740: d2884e48     	mov	x8, #0x4272             ; =17010
 4106744: f2b3c948     	movk	x8, #0x9e4a, lsl #16
 4106748: f2c88ca8     	movk	x8, #0x4465, lsl #32
 410674c: f2e003e8     	movk	x8, #0x1f, lsl #48
 4106750: eb08029f     	cmp	x20, x8
 4106754: 54000462     	b.hs	0x41067e0 <_ChromeMain+0x4101544>
 4106758: aa0103f3     	mov	x19, x1
 410675c: d100e3b5     	sub	x21, x29, #0x38
 4106760: 52810608     	mov	w8, #0x830              ; =2096
 4106764: 9b087e80     	mul	x0, x20, x8
 4106768: 96fc2300     	bl	0xf368 <_ChromeMain+0xa0cc>
 410676c: a90183e0     	stp	x0, x0, [sp, #0x18]
 4106770: a902d3ff     	stp	xzr, x20, [sp, #0x28]
 4106774: 910063e0     	add	x0, sp, #0x18
 4106778: d100e3a1     	sub	x1, x29, #0x38
 410677c: 910022a2     	add	x2, x21, #0x8
 4106780: 910042a3     	add	x3, x21, #0x10
 4106784: 94b197ca     	bl	0x6d6c6ac <_ChromeMain+0x6d67410>
 4106788: 910063e0     	add	x0, sp, #0x18
 410678c: 94b19814     	bl	0x6d6c7dc <_ChromeMain+0x6d67540>
 4106790: f9400668     	ldr	x8, [x19, #0x8]
 4106794: 52802f09     	mov	w9, #0x178              ; =376
 4106798: 9b097d14     	mul	x20, x8, x9
 410679c: a94083e2     	ldp	x2, x0, [sp, #0x8]
 41067a0: b4fff814     	cbz	x20, 0x41066a0 <_ChromeMain+0x4101404>
 41067a4: f9400273     	ldr	x19, [x19]
 41067a8: 910063e8     	add	x8, sp, #0x18
 41067ac: aa1303e0     	mov	x0, x19
 41067b0: 94dc6e94     	bl	0x7822200 <_ChromeMain+0x781cf64>
 41067b4: d100e3a0     	sub	x0, x29, #0x38
 41067b8: 910063e1     	add	x1, sp, #0x18
 41067bc: 94b1982f     	bl	0x6d6c878 <_ChromeMain+0x6d675dc>
 41067c0: 910063e0     	add	x0, sp, #0x18
 41067c4: 94b18ad6     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 41067c8: a94083e2     	ldp	x2, x0, [sp, #0x8]
 41067cc: 9105e273     	add	x19, x19, #0x178
 41067d0: f105e294     	subs	x20, x20, #0x178
 41067d4: 54fffea1     	b.ne	0x41067a8 <_ChromeMain+0x410150c>
 41067d8: 17ffffb2     	b	0x41066a0 <_ChromeMain+0x4101404>
 41067dc: d4200020     	brk	#0x1
 41067e0: 97783568     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
