
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4688e8c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688e90: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4688e94: 910043fd     	add	x29, sp, #0x10
 4688e98: aa0003f3     	mov	x19, x0
 4688e9c: 97265c35     	bl	0x101ff70 <_ChromeMain+0x101acd4>
 4688ea0: f8418c08     	ldr	x8, [x0, #0x18]!
 4688ea4: b4000268     	cbz	x8, 0x4688ef0 <_ChromeMain+0x4683c54>
 4688ea8: b9458269     	ldr	w9, [x19, #0x580]
 4688eac: b940210a     	ldr	w10, [x8, #0x20]
 4688eb0: 6b0a013f     	cmp	w9, w10
 4688eb4: 5400030b     	b.lt	0x4688f14 <_ChromeMain+0x4683c78>
 4688eb8: 5400034c     	b.gt	0x4688f20 <_ChromeMain+0x4683c84>
 4688ebc: eb00011f     	cmp	x8, x0
 4688ec0: 54000180     	b.eq	0x4688ef0 <_ChromeMain+0x4683c54>
 4688ec4: f9401501     	ldr	x1, [x8, #0x28]
 4688ec8: b4000141     	cbz	x1, 0x4688ef0 <_ChromeMain+0x4683c54>
 4688ecc: f942be68     	ldr	x8, [x19, #0x578]
 4688ed0: b4000108     	cbz	x8, 0x4688ef0 <_ChromeMain+0x4683c54>
 4688ed4: f9400100     	ldr	x0, [x8]
 4688ed8: 96f40595     	bl	0x38a52c <_ChromeMain+0x385290>
 4688edc: aa0003e8     	mov	x8, x0
 4688ee0: 3100051f     	cmn	w8, #0x1
 4688ee4: 1a9f07e9     	cset	w9, ne
 4688ee8: 6a09003f     	tst	w1, w9
 4688eec: 54000081     	b.ne	0x4688efc <_ChromeMain+0x4683c60>
 4688ef0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688ef4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688ef8: d65f03c0     	ret
 4688efc: f942be60     	ldr	x0, [x19, #0x578]
 4688f00: aa0803e1     	mov	x1, x8
 4688f04: 52800062     	mov	w2, #0x3                ; =3
 4688f08: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688f0c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688f10: 14db2428     	b	0x7d51fb0 <_ChromeMain+0x7d4cd14>
 4688f14: f9400108     	ldr	x8, [x8]
 4688f18: b5fffca8     	cbnz	x8, 0x4688eac <_ChromeMain+0x4683c10>
 4688f1c: 17fffff5     	b	0x4688ef0 <_ChromeMain+0x4683c54>
 4688f20: f9400508     	ldr	x8, [x8, #0x8]
 4688f24: b5fffc48     	cbnz	x8, 0x4688eac <_ChromeMain+0x4683c10>
 4688f28: 17fffff2     	b	0x4688ef0 <_ChromeMain+0x4683c54>
 4688f2c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688f30: a9017bfd     	stp	x29, x30, [sp, #0x10]
