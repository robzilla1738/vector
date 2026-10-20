
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461dd0c: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 461dd10: a9015ff8     	stp	x24, x23, [sp, #0x10]
 461dd14: a90257f6     	stp	x22, x21, [sp, #0x20]
 461dd18: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461dd1c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461dd20: 910103fd     	add	x29, sp, #0x40
 461dd24: aa0003f5     	mov	x21, x0
 461dd28: f9431017     	ldr	x23, [x0, #0x620]
 461dd2c: d37df2f3     	lsl	x19, x23, #3
 461dd30: b4000677     	cbz	x23, 0x461ddfc <_ChromeMain+0x4618b60>
 461dd34: d37dfee8     	lsr	x8, x23, #61
 461dd38: b5000988     	cbnz	x8, 0x461de68 <_ChromeMain+0x4618bcc>
 461dd3c: f9430eb6     	ldr	x22, [x21, #0x618]
 461dd40: aa1303e0     	mov	x0, x19
 461dd44: 96e7c589     	bl	0xf368 <_ChromeMain+0xa0cc>
 461dd48: aa0003f4     	mov	x20, x0
 461dd4c: aa1603e1     	mov	x1, x22
 461dd50: aa1303e2     	mov	x2, x19
 461dd54: 94e7c55e     	bl	0x800f2cc <_ChromeMain+0x800a030>
 461dd58: 9340f2f7     	sbfx	x23, x23, #0, #61
 461dd5c: aa1503e0     	mov	x0, x21
 461dd60: 97ffc8b7     	bl	0x461003c <_ChromeMain+0x460ada0>
 461dd64: f94312a8     	ldr	x8, [x21, #0x620]
 461dd68: eb17011f     	cmp	x8, x23
 461dd6c: 540000c1     	b.ne	0x461dd84 <_ChromeMain+0x4618ae8>
 461dd70: f9430ea0     	ldr	x0, [x21, #0x618]
 461dd74: d37df2e2     	lsl	x2, x23, #3
 461dd78: aa1403e1     	mov	x1, x20
 461dd7c: 94e7aeb9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461dd80: 34000460     	cbz	w0, 0x461de0c <_ChromeMain+0x4618b70>
 461dd84: 395bcea8     	ldrb	w8, [x21, #0x6f3]
 461dd88: 350003e8     	cbnz	w8, 0x461de04 <_ChromeMain+0x4618b68>
 461dd8c: 911bceb6     	add	x22, x21, #0x6f3
 461dd90: 925e76d8     	and	x24, x22, #0xfffffffc00000000
 461dd94: b0052cb9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461dd98: f9404728     	ldr	x8, [x25, #0x88]
 461dd9c: eb08031f     	cmp	x24, x8
 461dda0: 54000060     	b.eq	0x461ddac <_ChromeMain+0x4618b10>
 461dda4: 5280001a     	mov	w26, #0x0               ; =0
 461dda8: 14000004     	b	0x461ddb8 <_ChromeMain+0x4618b1c>
 461ddac: 911bcea0     	add	x0, x21, #0x6f3
 461ddb0: 96e7d953     	bl	0x142fc <_ChromeMain+0xf060>
 461ddb4: 394002da     	ldrb	w26, [x22]
 461ddb8: 52800008     	mov	w8, #0x0                ; =0
 461ddbc: 52800029     	mov	w9, #0x1                ; =1
 461ddc0: 391bcea9     	strb	w9, [x21, #0x6f3]
 461ddc4: 391bd2bf     	strb	wzr, [x21, #0x6f4]
 461ddc8: 12000101     	and	w1, w8, #0x1
 461ddcc: aa1503e0     	mov	x0, x21
 461ddd0: 97ffdf8c     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461ddd4: 395bd6a8     	ldrb	w8, [x21, #0x6f5]
 461ddd8: 395bd2a9     	ldrb	w9, [x21, #0x6f4]
 461dddc: 3707ff49     	tbnz	w9, #0x0, 0x461ddc4 <_ChromeMain+0x4618b28>
 461dde0: 390002da     	strb	w26, [x22]
 461dde4: f9404728     	ldr	x8, [x25, #0x88]
 461dde8: eb08031f     	cmp	x24, x8
 461ddec: 54000101     	b.ne	0x461de0c <_ChromeMain+0x4618b70>
 461ddf0: aa1603e0     	mov	x0, x22
 461ddf4: 96e81312     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461ddf8: 14000005     	b	0x461de0c <_ChromeMain+0x4618b70>
 461ddfc: d2800014     	mov	x20, #0x0               ; =0
 461de00: 17ffffd7     	b	0x461dd5c <_ChromeMain+0x4618ac0>
 461de04: 52800028     	mov	w8, #0x1                ; =1
 461de08: 790deaa8     	strh	w8, [x21, #0x6f4]
 461de0c: b50000f4     	cbnz	x20, 0x461de28 <_ChromeMain+0x4618b8c>
 461de10: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461de14: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461de18: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461de1c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 461de20: a8c567fa     	ldp	x26, x25, [sp], #0x50
 461de24: d65f03c0     	ret
 461de28: b4000117     	cbz	x23, 0x461de48 <_ChromeMain+0x4618bac>
 461de2c: cb170fe8     	neg	x8, x23, lsl #3
 461de30: 8b170e89     	add	x9, x20, x23, lsl #3
 461de34: d1002129     	sub	x9, x9, #0x8
 461de38: b40001a9     	cbz	x9, 0x461de6c <_ChromeMain+0x4618bd0>
 461de3c: d1002129     	sub	x9, x9, #0x8
 461de40: 91002108     	add	x8, x8, #0x8
 461de44: b5ffffa8     	cbnz	x8, 0x461de38 <_ChromeMain+0x4618b9c>
 461de48: aa1403e0     	mov	x0, x20
 461de4c: aa1303e1     	mov	x1, x19
 461de50: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461de54: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461de58: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461de5c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 461de60: a8c567fa     	ldp	x26, x25, [sp], #0x50
 461de64: 16e7ac15     	b	0x8eb8 <_ChromeMain+0x3c1c>
 461de68: 9763d7c6     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 461de6c: d4200020     	brk	#0x1
 461de70: f9429808     	ldr	x8, [x0, #0x530]
 461de74: b4000368     	cbz	x8, 0x461dee0 <_ChromeMain+0x4618c44>
 461de78: d10183ff     	sub	sp, sp, #0x60
 461de7c: a90357f6     	stp	x22, x21, [sp, #0x30]
