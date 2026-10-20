
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460d030: a9bd6ffc     	stp	x28, x27, [sp, #-0x30]!
 460d034: a9014ff4     	stp	x20, x19, [sp, #0x10]
 460d038: a9027bfd     	stp	x29, x30, [sp, #0x20]
 460d03c: 910083fd     	add	x29, sp, #0x20
 460d040: d10c83ff     	sub	sp, sp, #0x320
 460d044: aa0003f3     	mov	x19, x0
 460d048: 52800028     	mov	w8, #0x1                ; =1
 460d04c: 390fe008     	strb	w8, [x0, #0x3f8]
 460d050: 96fe504b     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460d054: f941ea74     	ldr	x20, [x19, #0x3d0]
 460d058: b4000274     	cbz	x20, 0x460d0a4 <_ChromeMain+0x4607e08>
 460d05c: f941aa80     	ldr	x0, [x20, #0x350]
 460d060: b4000220     	cbz	x0, 0x460d0a4 <_ChromeMain+0x4607e08>
 460d064: b40001b3     	cbz	x19, 0x460d098 <_ChromeMain+0x4607dfc>
 460d068: 39544288     	ldrb	w8, [x20, #0x510]
 460d06c: 37000148     	tbnz	w8, #0x0, 0x460d094 <_ChromeMain+0x4607df8>
 460d070: f941f268     	ldr	x8, [x19, #0x3e0]
 460d074: f941b689     	ldr	x9, [x20, #0x368]
 460d078: eb09011f     	cmp	x8, x9
 460d07c: 540000c2     	b.hs	0x460d094 <_ChromeMain+0x4607df8>
 460d080: f941b289     	ldr	x9, [x20, #0x360]
 460d084: 52804d0a     	mov	w10, #0x268             ; =616
 460d088: 9b0a2508     	madd	x8, x8, x10, x9
 460d08c: 39425108     	ldrb	w8, [x8, #0x94]
 460d090: 35000148     	cbnz	w8, 0x460d0b8 <_ChromeMain+0x4607e1c>
 460d094: d2800013     	mov	x19, #0x0               ; =0
 460d098: aa1303e1     	mov	x1, x19
 460d09c: 52800002     	mov	w2, #0x0                ; =0
 460d0a0: 97855cc8     	bl	0x27643c0 <_ChromeMain+0x275f124>
 460d0a4: 910c83ff     	add	sp, sp, #0x320
 460d0a8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 460d0ac: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 460d0b0: a8c36ffc     	ldp	x28, x27, [sp], #0x30
 460d0b4: d65f03c0     	ret
 460d0b8: 6f00e400     	movi.2d	v0, #0000000000000000
 460d0bc: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 460d0c0: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 460d0c4: ad0983e0     	stp	q0, q0, [sp, #0x130]
 460d0c8: ad0883e0     	stp	q0, q0, [sp, #0x110]
 460d0cc: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 460d0d0: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 460d0d4: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 460d0d8: ad0483e0     	stp	q0, q0, [sp, #0x90]
 460d0dc: ad0383e0     	stp	q0, q0, [sp, #0x70]
 460d0e0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 460d0e4: ad0183e0     	stp	q0, q0, [sp, #0x30]
 460d0e8: ad0083e0     	stp	q0, q0, [sp, #0x10]
 460d0ec: 3d8003e0     	str	q0, [sp]
 460d0f0: 910003e0     	mov	x0, sp
 460d0f4: 97ef30c2     	bl	0x41d93fc <_ChromeMain+0x41d4160>
 460d0f8: f941ea68     	ldr	x8, [x19, #0x3d0]
 460d0fc: f941f269     	ldr	x9, [x19, #0x3e0]
 460d100: f941b50a     	ldr	x10, [x8, #0x368]
 460d104: eb0a013f     	cmp	x9, x10
 460d108: 540000c2     	b.hs	0x460d120 <_ChromeMain+0x4607e84>
 460d10c: f941b10a     	ldr	x10, [x8, #0x360]
 460d110: 52804d0b     	mov	w11, #0x268             ; =616
 460d114: 9b0b2929     	madd	x9, x9, x11, x10
 460d118: 3942512a     	ldrb	w10, [x9, #0x94]
 460d11c: 350000ca     	cbnz	w10, 0x460d134 <_ChromeMain+0x4607e98>
 460d120: d2800013     	mov	x19, #0x0               ; =0
 460d124: 910003e0     	mov	x0, sp
 460d128: 972b7d56     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460d12c: f941aa80     	ldr	x0, [x20, #0x350]
 460d130: 17ffffda     	b	0x460d098 <_ChromeMain+0x4607dfc>
 460d134: f941a508     	ldr	x8, [x8, #0x348]
 460d138: b4ffff48     	cbz	x8, 0x460d120 <_ChromeMain+0x4607e84>
 460d13c: b9809121     	ldrsw	x1, [x9, #0x90]
 460d140: f9400100     	ldr	x0, [x8]
 460d144: 9729446d     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 460d148: b4fffec0     	cbz	x0, 0x460d120 <_ChromeMain+0x4607e84>
 460d14c: 910643e8     	add	x8, sp, #0x190
 460d150: 972b824c     	bl	0x10eda80 <_ChromeMain+0x10e87e4>
 460d154: 910003e0     	mov	x0, sp
 460d158: 910643e1     	add	x1, sp, #0x190
 460d15c: 97ef30d1     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 460d160: 910643e0     	add	x0, sp, #0x190
 460d164: 972b7d47     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 460d168: 910c4273     	add	x19, x19, #0x310
 460d16c: 910003e1     	mov	x1, sp
 460d170: aa1303e0     	mov	x0, x19
 460d174: 978830a1     	bl	0x28193f8 <_ChromeMain+0x281415c>
 460d178: 17ffffeb     	b	0x460d124 <_ChromeMain+0x4607e88>
 460d17c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 460d180: a9017bfd     	stp	x29, x30, [sp, #0x10]
 460d184: 910043fd     	add	x29, sp, #0x10
 460d188: aa0003f3     	mov	x19, x0
 460d18c: 390fe01f     	strb	wzr, [x0, #0x3f8]
 460d190: 96fe4ffb     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460d194: f941ea68     	ldr	x8, [x19, #0x3d0]
 460d198: b4000108     	cbz	x8, 0x460d1b8 <_ChromeMain+0x4607f1c>
 460d19c: f941a900     	ldr	x0, [x8, #0x350]
 460d1a0: b40000c0     	cbz	x0, 0x460d1b8 <_ChromeMain+0x4607f1c>
 460d1a4: d2800001     	mov	x1, #0x0                ; =0
 460d1a8: 52800002     	mov	w2, #0x0                ; =0
 460d1ac: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 460d1b0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 460d1b4: 17855c83     	b	0x27643c0 <_ChromeMain+0x275f124>
 460d1b8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 460d1bc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 460d1c0: d65f03c0     	ret
 460d1c4: 79411028     	ldrh	w8, [x1, #0x88]
 460d1c8: 7100811f     	cmp	w8, #0x20
 460d1cc: 7a4d1904     	ccmp	w8, #0xd, #0x4, ne
 460d1d0: 54000161     	b.ne	0x460d1fc <_ChromeMain+0x4607f60>
 460d1d4: f941e808     	ldr	x8, [x0, #0x3d0]
 460d1d8: b4000168     	cbz	x8, 0x460d204 <_ChromeMain+0x4607f68>
 460d1dc: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 460d1e0: 910003fd     	mov	x29, sp
 460d1e4: f941f001     	ldr	x1, [x0, #0x3e0]
 460d1e8: aa0803e0     	mov	x0, x8
 460d1ec: 97fff40f     	bl	0x460a228 <_ChromeMain+0x4604f8c>
 460d1f0: 52800020     	mov	w0, #0x1                ; =1
 460d1f4: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 460d1f8: d65f03c0     	ret
 460d1fc: 52800000     	mov	w0, #0x0                ; =0
 460d200: d65f03c0     	ret
 460d204: 52800020     	mov	w0, #0x1                ; =1
 460d208: d65f03c0     	ret
