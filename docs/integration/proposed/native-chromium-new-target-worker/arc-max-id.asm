
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426de00: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 426de04: a9014ff4     	stp	x20, x19, [sp, #0x10]
 426de08: a9027bfd     	stp	x29, x30, [sp, #0x20]
 426de0c: 910083fd     	add	x29, sp, #0x20
 426de10: aa0103f3     	mov	x19, x1
 426de14: 39406008     	ldrb	w8, [x0, #0x18]
 426de18: 71001d1f     	cmp	w8, #0x7
 426de1c: 54000100     	b.eq	0x426de3c <_ChromeMain+0x4268ba0>
 426de20: 7100191f     	cmp	w8, #0x6
 426de24: 54000241     	b.ne	0x426de6c <_ChromeMain+0x4268bd0>
 426de28: aa1303e1     	mov	x1, x19
 426de2c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 426de30: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 426de34: a8c357f6     	ldp	x22, x21, [sp], #0x30
 426de38: 17fffba2     	b	0x426ccc0 <_ChromeMain+0x4267a24>
 426de3c: a9402014     	ldp	x20, x8, [x0]
 426de40: 8b081689     	add	x9, x20, x8, lsl #5
 426de44: eb09029f     	cmp	x20, x9
 426de48: 540001a8     	b.hi	0x426de7c <_ChromeMain+0x4268be0>
 426de4c: d37be915     	lsl	x21, x8, #5
 426de50: b40000f5     	cbz	x21, 0x426de6c <_ChromeMain+0x4268bd0>
 426de54: aa1403e0     	mov	x0, x20
 426de58: aa1303e1     	mov	x1, x19
 426de5c: 97ffffe9     	bl	0x426de00 <_ChromeMain+0x4268b64>
 426de60: 91008294     	add	x20, x20, #0x20
 426de64: f10082b5     	subs	x21, x21, #0x20
 426de68: 54ffff61     	b.ne	0x426de54 <_ChromeMain+0x4268bb8>
 426de6c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 426de70: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 426de74: a8c357f6     	ldp	x22, x21, [sp], #0x30
 426de78: d65f03c0     	ret
 426de7c: d4200000     	brk	#0
 426de80: d4400000     	hlt	#0
 426de84: d4200020     	brk	#0x1
 426de88: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 426de8c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 426de90: 910043fd     	add	x29, sp, #0x10
 426de94: aa0003f3     	mov	x19, x0
 426de98: b004ffc8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 426de9c: 91372108     	add	x8, x8, #0xdc8
 426dea0: f9000008     	str	x8, [x0]
 426dea4: f900281f     	str	xzr, [x0, #0x50]
 426dea8: f9402408     	ldr	x8, [x0, #0x48]
 426deac: b4000168     	cbz	x8, 0x426ded8 <_ChromeMain+0x4268c3c>
 426deb0: 52800029     	mov	w9, #0x1                ; =1
 426deb4: 19004109     	stlurb	w9, [x8, #0x4]
 426deb8: f9402660     	ldr	x0, [x19, #0x48]
 426debc: b40000e0     	cbz	x0, 0x426ded8 <_ChromeMain+0x4268c3c>
 426dec0: 12800008     	mov	w8, #-0x1               ; =-1
 426dec4: b8e80008     	ldaddal	w8, w8, [x0]
 426dec8: 7100051f     	cmp	w8, #0x1
 426decc: 54000061     	b.ne	0x426ded8 <_ChromeMain+0x4268c3c>
 426ded0: 52800101     	mov	w1, #0x8                ; =8
 426ded4: 96f66bf9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426ded8: f9401e60     	ldr	x0, [x19, #0x38]
 426dedc: b5000180     	cbnz	x0, 0x426df0c <_ChromeMain+0x4268c70>
 426dee0: f9401a60     	ldr	x0, [x19, #0x30]
 426dee4: f9001a7f     	str	xzr, [x19, #0x30]
 426dee8: b4000060     	cbz	x0, 0x426def4 <_ChromeMain+0x4268c58>
 426deec: 52800201     	mov	w1, #0x10               ; =16
 426def0: 96f66bf2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426def4: 91002260     	add	x0, x19, #0x8
 426def8: 970c415a     	bl	0x57e460 <_ChromeMain+0x5791c4>
 426defc: aa1303e0     	mov	x0, x19
 426df00: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 426df04: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 426df08: d65f03c0     	ret
 426df0c: 9718f115     	bl	0x8aa360 <_ChromeMain+0x8a50c4>
 426df10: 17fffff4     	b	0x426dee0 <_ChromeMain+0x4268c44>
 426df14: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 426df18: a9017bfd     	stp	x29, x30, [sp, #0x10]
 426df1c: 910043fd     	add	x29, sp, #0x10
 426df20: aa0003f3     	mov	x19, x0
 426df24: b004ffc8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 426df28: 91372108     	add	x8, x8, #0xdc8
 426df2c: f9000008     	str	x8, [x0]
 426df30: f900281f     	str	xzr, [x0, #0x50]
 426df34: f9402408     	ldr	x8, [x0, #0x48]
 426df38: b4000168     	cbz	x8, 0x426df64 <_ChromeMain+0x4268cc8>
 426df3c: 52800029     	mov	w9, #0x1                ; =1
 426df40: 19004109     	stlurb	w9, [x8, #0x4]
 426df44: f9402660     	ldr	x0, [x19, #0x48]
 426df48: b40000e0     	cbz	x0, 0x426df64 <_ChromeMain+0x4268cc8>
 426df4c: 12800008     	mov	w8, #-0x1               ; =-1
 426df50: b8e80008     	ldaddal	w8, w8, [x0]
 426df54: 7100051f     	cmp	w8, #0x1
 426df58: 54000061     	b.ne	0x426df64 <_ChromeMain+0x4268cc8>
 426df5c: 52800101     	mov	w1, #0x8                ; =8
 426df60: 96f66bd6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426df64: f9401e60     	ldr	x0, [x19, #0x38]
 426df68: b50001a0     	cbnz	x0, 0x426df9c <_ChromeMain+0x4268d00>
 426df6c: f9401a60     	ldr	x0, [x19, #0x30]
 426df70: f9001a7f     	str	xzr, [x19, #0x30]
 426df74: b4000060     	cbz	x0, 0x426df80 <_ChromeMain+0x4268ce4>
 426df78: 52800201     	mov	w1, #0x10               ; =16
 426df7c: 96f66bcf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
