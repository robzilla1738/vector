
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  bddc50: d10403ff     	sub	sp, sp, #0x100
  bddc54: 6d082beb     	stp	d11, d10, [sp, #0x80]
  bddc58: 6d0923e9     	stp	d9, d8, [sp, #0x90]
  bddc5c: a90a6ffc     	stp	x28, x27, [sp, #0xa0]
  bddc60: a90b67fa     	stp	x26, x25, [sp, #0xb0]
  bddc64: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
  bddc68: a90d57f6     	stp	x22, x21, [sp, #0xd0]
  bddc6c: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
  bddc70: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
  bddc74: 9103c3fd     	add	x29, sp, #0xf0
  bddc78: aa0503f5     	mov	x21, x5
  bddc7c: aa0403f3     	mov	x19, x4
  bddc80: aa0003f4     	mov	x20, x0
  bddc84: a9040be1     	stp	x1, x2, [sp, #0x40]
  bddc88: f9400808     	ldr	x8, [x0, #0x10]
  bddc8c: 390083ff     	strb	wzr, [sp, #0x20]
  bddc90: 52801fe9     	mov	w9, #0xff               ; =255
  bddc94: 3900e3e9     	strb	w9, [sp, #0x38]
  bddc98: 39406069     	ldrb	w9, [x3, #0x18]
  bddc9c: 7100093f     	cmp	w9, #0x2
  bddca0: 5400096c     	b.gt	0xbdddcc <_ChromeMain+0xbd8b30>
  bddca4: 540005a1     	b.ne	0xbddd58 <_ChromeMain+0xbd8abc>
  bddca8: b940006a     	ldr	w10, [x3]
  bddcac: b90023ea     	str	w10, [sp, #0x20]
  bddcb0: 5280004b     	mov	w11, #0x2               ; =2
  bddcb4: 3900e3eb     	strb	w11, [sp, #0x38]
  bddcb8: b90053ea     	str	w10, [sp, #0x50]
  bddcbc: 3901a3e9     	strb	w9, [sp, #0x68]
  bddcc0: 91004100     	add	x0, x8, #0x10
  bddcc4: 910143e3     	add	x3, sp, #0x50
  bddcc8: 97f21f16     	bl	0x865920 <_ChromeMain+0x860684>
  bddccc: 3941a3e8     	ldrb	w8, [sp, #0x68]
  bddcd0: 9006e736     	adrp	x22, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
  bddcd4: 9121e2d6     	add	x22, x22, #0x878
  bddcd8: 7103fd1f     	cmp	w8, #0xff
  bddcdc: 54000060     	b.eq	0xbddce8 <_ChromeMain+0xbd8a4c>
  bddce0: 721e791f     	tst	w8, #0xfffffffd
  bddce4: 54000581     	b.ne	0xbddd94 <_ChromeMain+0xbd8af8>
  bddce8: 3940e3e8     	ldrb	w8, [sp, #0x38]
  bddcec: 7103fd1f     	cmp	w8, #0xff
  bddcf0: 54000060     	b.eq	0xbddcfc <_ChromeMain+0xbd8a60>
  bddcf4: 721e791f     	tst	w8, #0xfffffffd
  bddcf8: 540005c1     	b.ne	0xbdddb0 <_ChromeMain+0xbd8b14>
  bddcfc: 52801fe8     	mov	w8, #0xff               ; =255
  bddd00: 3900e3e8     	strb	w8, [sp, #0x38]
  bddd04: 35000f73     	cbnz	w19, 0xbddef0 <_ChromeMain+0xbd8c54>
  bddd08: 35002755     	cbnz	w21, 0xbde1f0 <_ChromeMain+0xbd8f54>
  bddd0c: a9440be1     	ldp	x1, x2, [sp, #0x40]
  bddd10: f9400288     	ldr	x8, [x20]
  bddd14: f9400908     	ldr	x8, [x8, #0x10]
  bddd18: b001bbc9     	adrp	x9, 0x4356000 <_ChromeMain+0x4350d64>
  bddd1c: 9111c129     	add	x9, x9, #0x470
  bddd20: eb09011f     	cmp	x8, x9
  bddd24: 54000221     	b.ne	0xbddd68 <_ChromeMain+0xbd8acc>
  bddd28: 7200067f     	tst	w19, #0x3
  bddd2c: 540002e1     	b.ne	0xbddd88 <_ChromeMain+0xbd8aec>
  bddd30: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
  bddd34: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
  bddd38: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
  bddd3c: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
  bddd40: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
  bddd44: a94a6ffc     	ldp	x28, x27, [sp, #0xa0]
  bddd48: 6d4923e9     	ldp	d9, d8, [sp, #0x90]
  bddd4c: 6d482beb     	ldp	d11, d10, [sp, #0x80]
  bddd50: 910403ff     	add	sp, sp, #0x100
  bddd54: d65f03c0     	ret
