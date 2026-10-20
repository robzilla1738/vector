
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  7d5c80: d10143ff     	sub	sp, sp, #0x50
  7d5c84: a9015ff8     	stp	x24, x23, [sp, #0x10]
  7d5c88: a90257f6     	stp	x22, x21, [sp, #0x20]
  7d5c8c: a9034ff4     	stp	x20, x19, [sp, #0x30]
  7d5c90: a9047bfd     	stp	x29, x30, [sp, #0x40]
  7d5c94: 910103fd     	add	x29, sp, #0x40
  7d5c98: aa0003f3     	mov	x19, x0
  7d5c9c: 3946d008     	ldrb	w8, [x0, #0x1b4]
  7d5ca0: 35001268     	cbnz	w8, 0x7d5eec <_ChromeMain+0x7d0c50>
  7d5ca4: f9400268     	ldr	x8, [x19]
  7d5ca8: f9417502     	ldr	x2, [x8, #0x2e8]
  7d5cac: 90008709     	adrp	x9, 0x18b5000 <_ChromeMain+0x18afd64>
  7d5cb0: 9106e129     	add	x9, x9, #0x1b8
  7d5cb4: eb09005f     	cmp	x2, x9
  7d5cb8: 54000360     	b.eq	0x7d5d24 <_ChromeMain+0x7d0a88>
  7d5cbc: 10001c28     	adr	x8, 0x7d6040 <_ChromeMain+0x7d0da4>
  7d5cc0: d503201f     	nop
  7d5cc4: aa1303e0     	mov	x0, x19
  7d5cc8: eb08005f     	cmp	x2, x8
  7d5ccc: 540000e0     	b.eq	0x7d5ce8 <_ChromeMain+0x7d0a4c>
  7d5cd0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
  7d5cd4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
  7d5cd8: a94257f6     	ldp	x22, x21, [sp, #0x20]
  7d5cdc: a9415ff8     	ldp	x24, x23, [sp, #0x10]
  7d5ce0: 910143ff     	add	sp, sp, #0x50
  7d5ce4: d61f0040     	br	x2
  7d5ce8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
  7d5cec: a9434ff4     	ldp	x20, x19, [sp, #0x30]
  7d5cf0: a94257f6     	ldp	x22, x21, [sp, #0x20]
  7d5cf4: a9415ff8     	ldp	x24, x23, [sp, #0x10]
  7d5cf8: 910143ff     	add	sp, sp, #0x50
  7d5cfc: 140000d1     	b	0x7d6040 <_ChromeMain+0x7d0da4>
