
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457a30c: 52801bc8     	mov	w8, #0xde               ; =222
 457a310: b81183a8     	stur	w8, [x29, #-0xe8]
 457a314: 3811c3bf     	sturb	wzr, [x29, #-0xe4]
 457a318: d103a3a3     	sub	x3, x29, #0xe8
 457a31c: aa1503e0     	mov	x0, x21
 457a320: 52800181     	mov	w1, #0xc                ; =12
 457a324: 52803202     	mov	w2, #0x190              ; =400
 457a328: 52800004     	mov	w4, #0x0                ; =0
 457a32c: 97fffce5     	bl	0x45796c0 <_ChromeMain+0x4574424>
 457a330: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 457a334: 52800108     	mov	w8, #0x8                ; =8
 457a338: b81343a8     	stur	w8, [x29, #-0xcc]
 457a33c: f0052441     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 457a340: 91122021     	add	x1, x1, #0x488
 457a344: 910362a0     	add	x0, x21, #0xd8
 457a348: d10343a2     	sub	x2, x29, #0xd0
 457a34c: 97a2290d     	bl	0x2e04780 <_ChromeMain+0x2dff4e4>
