
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  5cf5b0: 3900601f     	strb	wzr, [x0, #0x18]
  5cf5b4: 7100103f     	cmp	w1, #0x4
  5cf5b8: 5400016c     	b.gt	0x5cf5e4 <_ChromeMain+0x5ca348>
  5cf5bc: 7100083f     	cmp	w1, #0x2
  5cf5c0: 540002ed     	b.le	0x5cf61c <_ChromeMain+0x5ca380>
  5cf5c4: 7100103f     	cmp	w1, #0x4
  5cf5c8: 54000521     	b.ne	0x5cf66c <_ChromeMain+0x5ca3d0>
  5cf5cc: b4000320     	cbz	x0, 0x5cf630 <_ChromeMain+0x5ca394>
  5cf5d0: a9007c1f     	stp	xzr, xzr, [x0]
  5cf5d4: f900081f     	str	xzr, [x0, #0x10]
  5cf5d8: 52800088     	mov	w8, #0x4                ; =4
  5cf5dc: 39006008     	strb	w8, [x0, #0x18]
  5cf5e0: d65f03c0     	ret
  5cf5e4: 7100183f     	cmp	w1, #0x6
  5cf5e8: 540000c1     	b.ne	0x5cf600 <_ChromeMain+0x5ca364>
  5cf5ec: b4000220     	cbz	x0, 0x5cf630 <_ChromeMain+0x5ca394>
  5cf5f0: a9007c1f     	stp	xzr, xzr, [x0]
  5cf5f4: f900081f     	str	xzr, [x0, #0x10]
  5cf5f8: 528000c8     	mov	w8, #0x6                ; =6
  5cf5fc: 17fffff8     	b	0x5cf5dc <_ChromeMain+0x5ca340>
  5cf600: 71001c3f     	cmp	w1, #0x7
  5cf604: 54000261     	b.ne	0x5cf650 <_ChromeMain+0x5ca3b4>
  5cf608: b4000140     	cbz	x0, 0x5cf630 <_ChromeMain+0x5ca394>
  5cf60c: a9007c1f     	stp	xzr, xzr, [x0]
  5cf610: f900081f     	str	xzr, [x0, #0x10]
  5cf614: 528000e8     	mov	w8, #0x7                ; =7
  5cf618: 17fffff1     	b	0x5cf5dc <_ChromeMain+0x5ca340>
  5cf61c: 540000c1     	b.ne	0x5cf634 <_ChromeMain+0x5ca398>
  5cf620: b4000080     	cbz	x0, 0x5cf630 <_ChromeMain+0x5ca394>
