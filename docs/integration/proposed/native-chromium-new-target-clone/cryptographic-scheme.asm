
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  f4c19c: b9402408     	ldr	w8, [x0, #0x24]
  f4c1a0: 7100051f     	cmp	w8, #0x1
  f4c1a4: 5400026b     	b.lt	0xf4c1f0 <_ChromeMain+0xf46f54>
  f4c1a8: 39405c0a     	ldrb	w10, [x0, #0x17]
  f4c1ac: 13001d49     	sxtb	w9, w10
  f4c1b0: f940040b     	ldr	x11, [x0, #0x8]
  f4c1b4: 7100013f     	cmp	w9, #0x0
  f4c1b8: 9a8a416b     	csel	x11, x11, x10, mi
  f4c1bc: b980200a     	ldrsw	x10, [x0, #0x20]
  f4c1c0: eb0a016b     	subs	x11, x11, x10
  f4c1c4: 540002e3     	b.lo	0xf4c220 <_ChromeMain+0xf46f84>
  f4c1c8: f940000c     	ldr	x12, [x0]
  f4c1cc: 7100013f     	cmp	w9, #0x0
  f4c1d0: 9a80418c     	csel	x12, x12, x0, mi
  f4c1d4: eb08017f     	cmp	x11, x8
  f4c1d8: 9a883169     	csel	x9, x11, x8, lo
  f4c1dc: 8b0a0188     	add	x8, x12, x10
  f4c1e0: f100153f     	cmp	x9, #0x5
  f4c1e4: 540000a0     	b.eq	0xf4c1f8 <_ChromeMain+0xf46f5c>
  f4c1e8: f1000d3f     	cmp	x9, #0x3
  f4c1ec: 54000240     	b.eq	0xf4c234 <_ChromeMain+0xf46f98>
  f4c1f0: 52800000     	mov	w0, #0x0                ; =0
  f4c1f4: d65f03c0     	ret
  f4c1f8: b9400109     	ldr	w9, [x8]
  f4c1fc: 9005e6aa     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
  f4c200: 9101154a     	add	x10, x10, #0x45
  f4c204: b940014b     	ldr	w11, [x10]
  f4c208: 39401108     	ldrb	w8, [x8, #0x4]
  f4c20c: 3940114a     	ldrb	w10, [x10, #0x4]
  f4c210: 6b0b013f     	cmp	w9, w11
  f4c214: 7a4a0100     	ccmp	w8, w10, #0x0, eq
  f4c218: 1a9f17e0     	cset	w0, eq
  f4c21c: d65f03c0     	ret
  f4c220: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
  f4c224: 910003fd     	mov	x29, sp
  f4c228: 900644c0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
  f4c22c: 91376000     	add	x0, x0, #0xdd8
  f4c230: 94f2d029     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
  f4c234: 79400109     	ldrh	w9, [x8]
  f4c238: 9005e6aa     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
  f4c23c: 9100f54a     	add	x10, x10, #0x3d
  f4c240: 7940014b     	ldrh	w11, [x10]
  f4c244: 39400908     	ldrb	w8, [x8, #0x2]
  f4c248: 3940094a     	ldrb	w10, [x10, #0x2]
  f4c24c: 17fffff1     	b	0xf4c210 <_ChromeMain+0xf46f74>
