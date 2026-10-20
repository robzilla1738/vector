
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4599800: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4599804: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4599808: a9027bfd     	stp	x29, x30, [sp, #0x20]
 459980c: 910083fd     	add	x29, sp, #0x20
 4599810: 39402828     	ldrb	w8, [x1, #0xa]
 4599814: 360800a8     	tbz	w8, #0x1, 0x4599828 <_ChromeMain+0x459458c>
 4599818: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 459981c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4599820: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4599824: d65f03c0     	ret
 4599828: f9402413     	ldr	x19, [x0, #0x48]
 459982c: b4ffff73     	cbz	x19, 0x4599818 <_ChromeMain+0x459457c>
 4599830: f9402e68     	ldr	x8, [x19, #0x58]
 4599834: b4000208     	cbz	x8, 0x4599874 <_ChromeMain+0x45945d8>
 4599838: f9407109     	ldr	x9, [x8, #0xe0]
 459983c: b40001c9     	cbz	x9, 0x4599874 <_ChromeMain+0x45945d8>
 4599840: 19404129     	ldapurb	w9, [x9, #0x4]
 4599844: 35000189     	cbnz	w9, 0x4599874 <_ChromeMain+0x45945d8>
 4599848: f9407509     	ldr	x9, [x8, #0xe8]
 459984c: b4000149     	cbz	x9, 0x4599874 <_ChromeMain+0x45945d8>
 4599850: f9407109     	ldr	x9, [x8, #0xe0]
 4599854: b40006e9     	cbz	x9, 0x4599930 <_ChromeMain+0x4594694>
 4599858: 19404129     	ldapurb	w9, [x9, #0x4]
 459985c: 350006a9     	cbnz	w9, 0x4599930 <_ChromeMain+0x4594694>
 4599860: f9407508     	ldr	x8, [x8, #0xe8]
 4599864: f9402508     	ldr	x8, [x8, #0x48]
 4599868: b4000068     	cbz	x8, 0x4599874 <_ChromeMain+0x45945d8>
 459986c: 3949a108     	ldrb	w8, [x8, #0x268]
 4599870: 350000c8     	cbnz	w8, 0x4599888 <_ChromeMain+0x45945ec>
 4599874: aa1303e0     	mov	x0, x19
 4599878: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 459987c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4599880: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4599884: 17ffefbe     	b	0x459577c <_ChromeMain+0x45904e0>
 4599888: f9402e68     	ldr	x8, [x19, #0x58]
 459988c: b4fffc68     	cbz	x8, 0x4599818 <_ChromeMain+0x459457c>
 4599890: f9407109     	ldr	x9, [x8, #0xe0]
 4599894: b4fffc29     	cbz	x9, 0x4599818 <_ChromeMain+0x459457c>
 4599898: 19404129     	ldapurb	w9, [x9, #0x4]
 459989c: 35fffbe9     	cbnz	w9, 0x4599818 <_ChromeMain+0x459457c>
 45998a0: f9407509     	ldr	x9, [x8, #0xe8]
 45998a4: b4fffba9     	cbz	x9, 0x4599818 <_ChromeMain+0x459457c>
 45998a8: f9407109     	ldr	x9, [x8, #0xe0]
 45998ac: b4000489     	cbz	x9, 0x459993c <_ChromeMain+0x45946a0>
 45998b0: 19404129     	ldapurb	w9, [x9, #0x4]
 45998b4: 35000449     	cbnz	w9, 0x459993c <_ChromeMain+0x45946a0>
 45998b8: f9407508     	ldr	x8, [x8, #0xe8]
 45998bc: f9402508     	ldr	x8, [x8, #0x48]
 45998c0: b4fffac8     	cbz	x8, 0x4599818 <_ChromeMain+0x459457c>
 45998c4: 3949a108     	ldrb	w8, [x8, #0x268]
 45998c8: 34fffa88     	cbz	w8, 0x4599818 <_ChromeMain+0x459457c>
 45998cc: f9405268     	ldr	x8, [x19, #0xa0]
 45998d0: f9400115     	ldr	x21, [x8]
 45998d4: 910082a0     	add	x0, x21, #0x20
 45998d8: 95034a0d     	bl	0x866c10c <_ChromeMain+0x8666e70>
 45998dc: aa0003f4     	mov	x20, x0
 45998e0: 390002bf     	strb	wzr, [x21]
 45998e4: 910082a0     	add	x0, x21, #0x20
 45998e8: d2800001     	mov	x1, #0x0                ; =0
 45998ec: 95034a05     	bl	0x866c100 <_ChromeMain+0x8666e64>
 45998f0: aa1403e0     	mov	x0, x20
 45998f4: 9562ff2e     	bl	0x9e595ac <_ChromeMain+0x9e54310>
 45998f8: 340000e0     	cbz	w0, 0x4599914 <_ChromeMain+0x4594678>
 45998fc: aa1403e0     	mov	x0, x20
 4599900: 95ffec56     	bl	0xc594a58 <_ChromeMain+0xc58f7bc>
 4599904: 34000080     	cbz	w0, 0x4599914 <_ChromeMain+0x4594678>
 4599908: aa1403e0     	mov	x0, x20
 459990c: d2800002     	mov	x2, #0x0                ; =0
 4599910: 95ec203a     	bl	0xc0a19f8 <_ChromeMain+0xc09c75c>
 4599914: aa1403e0     	mov	x0, x20
 4599918: 94e9a791     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 459991c: aa1303e0     	mov	x0, x19
 4599920: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4599924: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4599928: a8c357f6     	ldp	x22, x21, [sp], #0x30
 459992c: 17fffb12     	b	0x4598574 <_ChromeMain+0x45932d8>
 4599930: d4200000     	brk	#0
 4599934: d4400000     	hlt	#0
 4599938: d4200020     	brk	#0x1
 459993c: d4200000     	brk	#0
 4599940: d4400000     	hlt	#0
 4599944: d4200020     	brk	#0x1
