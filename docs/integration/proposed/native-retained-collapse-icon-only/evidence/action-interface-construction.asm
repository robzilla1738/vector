
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41fbda4: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41fbda8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41fbdac: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41fbdb0: 910083fd     	add	x29, sp, #0x20
 41fbdb4: aa0003f3     	mov	x19, x0
 41fbdb8: 52800400     	mov	w0, #0x20               ; =32
 41fbdbc: 96f84d6b     	bl	0xf368 <_ChromeMain+0xa0cc>
 41fbdc0: aa0003f4     	mov	x20, x0
 41fbdc4: 925e7676     	and	x22, x19, #0xfffffffc00000000
 41fbdc8: f0054db5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41fbdcc: f94046a8     	ldr	x8, [x21, #0x88]
 41fbdd0: eb0802df     	cmp	x22, x8
 41fbdd4: 54000061     	b.ne	0x41fbde0 <_ChromeMain+0x41f6b44>
 41fbdd8: aa1303e0     	mov	x0, x19
 41fbddc: 96f86148     	bl	0x142fc <_ChromeMain+0xf060>
 41fbde0: f9000693     	str	x19, [x20, #0x8]
 41fbde4: f94046a8     	ldr	x8, [x21, #0x88]
 41fbde8: eb0802df     	cmp	x22, x8
 41fbdec: 54000061     	b.ne	0x41fbdf8 <_ChromeMain+0x41f6b5c>
 41fbdf0: aa1303e0     	mov	x0, x19
 41fbdf4: 96f86142     	bl	0x142fc <_ChromeMain+0xf060>
 41fbdf8: f9000a93     	str	x19, [x20, #0x10]
 41fbdfc: b0050168     	adrp	x8, 0xe228000 <dyld_stub_binder+0xe228000>
 41fbe00: 912a4108     	add	x8, x8, #0xa90
 41fbe04: f9000288     	str	x8, [x20]
 41fbe08: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41fbe0c: f94046a9     	ldr	x9, [x21, #0x88]
 41fbe10: eb09011f     	cmp	x8, x9
 41fbe14: 54000061     	b.ne	0x41fbe20 <_ChromeMain+0x41f6b84>
 41fbe18: aa1303e0     	mov	x0, x19
 41fbe1c: 96f86138     	bl	0x142fc <_ChromeMain+0xf060>
 41fbe20: f9000e93     	str	x19, [x20, #0x18]
 41fbe24: aa1403e0     	mov	x0, x20
 41fbe28: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41fbe2c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41fbe30: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41fbe34: d65f03c0     	ret
