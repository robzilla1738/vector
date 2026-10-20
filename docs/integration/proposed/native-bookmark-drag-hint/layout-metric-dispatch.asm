
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  5038c0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
  5038c4: a9017bfd     	stp	x29, x30, [sp, #0x10]
  5038c8: 910043fd     	add	x29, sp, #0x10
  5038cc: aa0003f3     	mov	x19, x0
  5038d0: 94008fd2     	bl	0x527818 <_ChromeMain+0x52257c>
  5038d4: b9400808     	ldr	w8, [x0, #0x8]
  5038d8: 7100091f     	cmp	w8, #0x2
  5038dc: 540000a0     	b.eq	0x5038f0 <_ChromeMain+0x4fe654>
  5038e0: 7100051f     	cmp	w8, #0x1
  5038e4: 540000a0     	b.eq	0x5038f8 <_ChromeMain+0x4fe65c>
  5038e8: 52800008     	mov	w8, #0x0                ; =0
  5038ec: 14000004     	b	0x5038fc <_ChromeMain+0x4fe660>
  5038f0: 52800028     	mov	w8, #0x1                ; =1
  5038f4: 14000002     	b	0x5038fc <_ChromeMain+0x4fe660>
  5038f8: 39403008     	ldrb	w8, [x0, #0xc]
  5038fc: 7101267f     	cmp	w19, #0x49
  503900: 54001468     	b.hi	0x503b8c <_ChromeMain+0x4fe8f0>
  503904: 52800300     	mov	w0, #0x18               ; =24
  503908: 2a1303e9     	mov	w9, w19
  50390c: b0064eaa     	adrp	x10, 0xced8000 <dyld_stub_binder+0xced8000>
  503910: 9107214a     	add	x10, x10, #0x1c8
  503914: 1000000b     	adr	x11, 0x503914 <_ChromeMain+0x4fe678>
  503918: b8a9794c     	ldrsw	x12, [x10, x9, lsl #2]
  50391c: 8b0c016b     	add	x11, x11, x12
  503920: d61f0160     	br	x11
