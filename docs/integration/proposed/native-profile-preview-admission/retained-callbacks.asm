
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46508b4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46508b8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46508bc: 910043fd     	add	x29, sp, #0x10
 46508c0: aa0003f3     	mov	x19, x0
 46508c4: 97fffe52     	bl	0x465020c <_ChromeMain+0x464af70>
 46508c8: 350000a0     	cbnz	w0, 0x46508dc <_ChromeMain+0x464b640>
 46508cc: aa1303e0     	mov	x0, x19
 46508d0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46508d4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46508d8: 14000008     	b	0x46508f8 <_ChromeMain+0x464b65c>
 46508dc: aa1303e0     	mov	x0, x19
 46508e0: 97ffff58     	bl	0x4650640 <_ChromeMain+0x464b3a4>
 46508e4: aa1303e0     	mov	x0, x19
 46508e8: 52802021     	mov	w1, #0x101              ; =257
 46508ec: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46508f0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46508f4: 17baa33d     	b	0x34f95e8 <_ChromeMain+0x34f434c>
 46508f8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46508fc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4650900: 910043fd     	add	x29, sp, #0x10
 4650904: aa0003f3     	mov	x19, x0
 4650908: b94c8c14     	ldr	w20, [x0, #0xc8c]
 465090c: 91250000     	add	x0, x0, #0x940
 4650910: 97037782     	bl	0x72e718 <_ChromeMain+0x72947c>
 4650914: 7100069f     	cmp	w20, #0x1
 4650918: 540000cb     	b.lt	0x4650930 <_ChromeMain+0x464b694>
 465091c: aa1303e0     	mov	x0, x19
 4650920: d2800001     	mov	x1, #0x0                ; =0
 4650924: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4650928: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465092c: 17baa32f     	b	0x34f95e8 <_ChromeMain+0x34f434c>
 4650930: 91268260     	add	x0, x19, #0x9a0
 4650934: 97037779     	bl	0x72e718 <_ChromeMain+0x72947c>
 4650938: 7914167f     	strh	wzr, [x19, #0xa0a]
 465093c: 39683269     	ldrb	w9, [x19, #0xa0c]
 4650940: 39682268     	ldrb	w8, [x19, #0xa08]
 4650944: 37000149     	tbnz	w9, #0x0, 0x465096c <_ChromeMain+0x464b6d0>
 4650948: 37000088     	tbnz	w8, #0x0, 0x4650958 <_ChromeMain+0x464b6bc>
 465094c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4650950: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650954: d65f03c0     	ret
 4650958: aa1303e0     	mov	x0, x19
 465095c: 52800001     	mov	w1, #0x0                ; =0
 4650960: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4650964: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650968: 14000027     	b	0x4650a04 <_ChromeMain+0x464b768>
 465096c: 35ffff68     	cbnz	w8, 0x4650958 <_ChromeMain+0x464b6bc>
 4650970: 3928327f     	strb	wzr, [x19, #0xa0c]
 4650974: aa1303e0     	mov	x0, x19
 4650978: 52800021     	mov	w1, #0x1                ; =1
 465097c: 97ffe7d1     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 4650980: aa1303e0     	mov	x0, x19
 4650984: 52800001     	mov	w1, #0x0                ; =0
 4650988: 96ff7ebb     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465098c: f9422e68     	ldr	x8, [x19, #0x458]
 4650990: 9107c100     	add	x0, x8, #0x1f0
 4650994: 52800001     	mov	w1, #0x0                ; =0
 4650998: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465099c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46509a0: 16ff7eb5     	b	0x630474 <_ChromeMain+0x62b1d8>
 46509a4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46509a8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46509ac: 910043fd     	add	x29, sp, #0x10
 46509b0: aa0003f3     	mov	x19, x0
 46509b4: 39683008     	ldrb	w8, [x0, #0xa0c]
 46509b8: 370000a8     	tbnz	w8, #0x0, 0x46509cc <_ChromeMain+0x464b730>
 46509bc: 91268260     	add	x0, x19, #0x9a0
 46509c0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46509c4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46509c8: 17037754     	b	0x72e718 <_ChromeMain+0x72947c>
 46509cc: 39682a68     	ldrb	w8, [x19, #0xa0a]
 46509d0: 370000c8     	tbnz	w8, #0x0, 0x46509e8 <_ChromeMain+0x464b74c>
 46509d4: 39682e68     	ldrb	w8, [x19, #0xa0b]
 46509d8: 37000088     	tbnz	w8, #0x0, 0x46509e8 <_ChromeMain+0x464b74c>
 46509dc: aa1303e0     	mov	x0, x19
 46509e0: 97fffe0b     	bl	0x465020c <_ChromeMain+0x464af70>
 46509e4: 36000080     	tbz	w0, #0x0, 0x46509f4 <_ChromeMain+0x464b758>
 46509e8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46509ec: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46509f0: d65f03c0     	ret
 46509f4: aa1303e0     	mov	x0, x19
 46509f8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46509fc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650a00: 17ffffbe     	b	0x46508f8 <_ChromeMain+0x464b65c>
