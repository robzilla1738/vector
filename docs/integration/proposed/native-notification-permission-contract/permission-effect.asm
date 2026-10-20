
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 77d8500: 7100085f     	cmp	w2, #0x2
 77d8504: 540003c8     	b.hi	0x77d857c <_ChromeMain+0x77d32e0>
 77d8508: d10303ff     	sub	sp, sp, #0xc0
 77d850c: a90957f6     	stp	x22, x21, [sp, #0x90]
 77d8510: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 77d8514: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 77d8518: 9102c3fd     	add	x29, sp, #0xb0
 77d851c: aa0203f3     	mov	x19, x2
 77d8520: aa0103f4     	mov	x20, x1
 77d8524: 96804623     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 77d8528: aa0003f5     	mov	x21, x0
 77d852c: 910063e0     	add	x0, sp, #0x18
 77d8530: 96bdffd4     	bl	0x2758480 <_ChromeMain+0x27531e4>
 77d8534: 910003e0     	mov	x0, sp
 77d8538: 96f8a605     	bl	0x3601d4c <_ChromeMain+0x35fcab0>
 77d853c: 910063e2     	add	x2, sp, #0x18
 77d8540: 910003e5     	mov	x5, sp
 77d8544: aa1503e0     	mov	x0, x21
 77d8548: aa1403e1     	mov	x1, x20
 77d854c: 528000c3     	mov	w3, #0x6                ; =6
 77d8550: aa1303e4     	mov	x4, x19
 77d8554: 94b233a1     	bl	0xa4653d8 <_ChromeMain+0xa46013c>
 77d8558: 910003e0     	mov	x0, sp
 77d855c: 9620ea19     	bl	0x12dc0 <_ChromeMain+0xdb24>
 77d8560: 910063e0     	add	x0, sp, #0x18
 77d8564: 96213db2     	bl	0x27c2c <_ChromeMain+0x22990>
 77d8568: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 77d856c: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 77d8570: a94957f6     	ldp	x22, x21, [sp, #0x90]
 77d8574: 910303ff     	add	sp, sp, #0xc0
 77d8578: d65f03c0     	ret
 77d857c: d4200000     	brk	#0
